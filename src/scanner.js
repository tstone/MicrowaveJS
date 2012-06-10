require('./vendor/date');

var path        = require('path')
  , fs          = require('fs')
  , yaml        = require('js-yaml')
  , showdown    = require('./vendor/showdown')
  , markdown    = new showdown.converter()
  , slugify     = require('./lib').slugify
  , titleize    = require('./lib').titleize
  ;


//
// :: Parse Header -> Turn YAML into a meaningful structure

var parseHeader = function(raw, path) {
    // Init empty stub
    var header = {
        tags: []
    };

    // Check for YAML configuration data
    if (typeof raw === 'string' && raw.length > 0) {
        var config = yaml.load(raw);
        
        // Convert config to lowercase
        for (var prop in config) {
            if (config.hasOwnProperty(prop)) {
                config[prop.toLowerCase()] = config[prop];
            }
        }

        header.comments = config.comments;
        header.title = config.title;
        header.date = Date.parse(config.date);
        header.slug = config.slug;

        // Accept either comma-delimited or YAML array for tags
        if (config.tags) {
            if (typeof config.tags === 'string') {
                config.tags = config.tags.split(',');
            }
            header.tags = config.tags.map(function(x){ return x.toLowerCase().trim(); });
        } else {
            header.tags = [];
        }
    }

    // Fill in date if it's lacking
    if (typeof header.date === 'undefined') {
        var stats = fs.statSync(path);
        header.date = stats.ctime;
    }

    // Fill in title if it's lacking
    if (typeof header.title === 'undefined') {
        var name = fileNameFromPath(path);
        if (name.indexOf('.') > -1) {
            name = name.substr(0, name.lastIndexOf('.'));
        }
        var seperator = (name.lastIndexOf('\\') > -1) ? '\\' : '/';
        name = name.substr(name.lastIndexOf(seperator) + 1, name.length);
		header.title = titleize(name);
    }

    // Generate slug
    if (typeof header.slug === 'undefined') {
        header.slug = slugify(header.title);
    }

    return header;
};


//
// :: Render Body -> Format blog post in proper HTML

var renderBody = function(raw, format) {
    
    var addPrettifyHints = function(html) {
        
        // Replace <pre><code> or <code> and look for lang: []
        var prePattern = new RegExp('(<pre>)?<code>(?:lang:[\\s]*([a-z]+)[\\s\\r\\n]*)?', 'gi');
        var m = prePattern.exec(html);
        while (m) {
            // Sort out groups
            var pre = '', lang = '';
            if (m[1] === '<pre>') { pre = m[1]; lang = m[2]; }
            else if (m[1]) { lang = m[1]; }

            // Build new HTML
            var tag = ''
              , suffix = '>'
              , classes = 'prettyprint';

            if (pre) {
                tag = 'pre';
                suffix = ' tabIndex="0"><code data-inner="1">';
                classes += ' linenums';
            } else {
                tag = 'code';
            }
            if (lang) {
                classes += ' lang-' + lang;
            }

            html = html.replace(m[0], '<' + tag + ' class="' + classes + '"' + suffix);
            m = prePattern.exec(html);
        }

        // Trim trailing whitespace automatically
        html = html.replace(/\s<\/code>/gi, '</code>');
        return html;
    };

    if (format === 'md' || format === 'markdown') {             // Markdown
        
        // Convert github style code into regular markdown
        var i = raw.indexOf('```');
        while (i > -1) {
            var start = i + 4
              , end = raw.indexOf('```', start) - 1
              , code = raw.substr(start, end - start).trim()
              , newCode = code.split('\n').reduce(function(acc, x){
                    return acc + '\n    ' + x.trim();
                }, '')
              , raw = raw.substr(0, i - 1) + newCode + raw.substr(end + 5)
              , i = raw.indexOf('```');
        }

        // Html -> Markdown
        var html = markdown.makeHtml(raw);
        return addPrettifyHints(html);

    } else if (format === 'html' || format === 'htm') {         // HTML
        return addPrettifyHints(raw);
    } else {                                                    // Plain / other
        return raw;
    }
};


//
// :: Parse Blog Post File -> Given a file path, turn it into a meaningful structure

var parseBlogPostFile = function(path) {
    // Read the file off of disk and slice it by it's config
    var raw = fs.readFileSync(path, 'ascii')
      , headerTerminator = raw.indexOf('*/')
      , rawHeader = ''
      , rawBody = ''
      ;

    if (headerTerminator > 0) {
        rawHeader = raw.substr(2, headerTerminator - 2).trim();
        rawBody = raw.substr(headerTerminator + 2).trim();
    } else {
        rawBody = raw;
    }

    // Parse the header and render the body
    var post = parseHeader(rawHeader, path)
      , format = path.substr(path.lastIndexOf('.') + 1)
      ;

    post.body = renderBody(rawBody, format);
    return post;
};


//
// :: File Name From Path -> Get the file name from the full path minus the extension
var fileNameFromPath = function(path){
	var name = path;
	if(name.lastIndexOf('/') > 0){
		name = name.split('/').pop();
	}
	name = name.substr(0, name.lastIndexOf('.'));
	return name;
};


//
// :: Scan -> Search the given directory for files, assumed to be blog posts

var scan = function(app, settings, routes, callback) {

    var postTable = {}
      , futurePostTable = {}
      , postList = []
      , futurePostList = []
      , postDir = path.join(__dirname, '../', settings.posts)
      ;

    fs.readdir(postDir, function(err, files){
        var now = Date.now();
        files.forEach(function(f){
            var filePath = path.join(__dirname, '../', settings.posts, f)
              , stats = fs.statSync(filePath);

            if(stats.isDirectory()) { return; } // skip if file is acutally a directory

            var post = parseBlogPostFile(filePath, f);
            if (postTable[post.slug]){
                console.warn('An entry for slug "' + post.slug + '" already exists!');
            } else {
                // Store post in in-memory lookup structures
                if (post.date > now) {
                    futurePostTable[post.slug] = post;
                    futurePostList.push({
                        slug: post.slug,
                        date: post.date
                    });
                } else {
                    postTable[post.slug] = post;
                    postList.push({
                        slug: post.slug,
                        date: post.date
                    });
                }
            }
        });

        // Sort list
        postList.sort(function(a, b){
            return b.date - a.date;
        });

        // Methods to get the post data
        var getPostList = function() {
            // Re-check the date against right now
            var now = Date.now();
            var indexes = [];
            futurePostList = futurePostList.map(function(x, i){
                if (x && x.date <= now) {
                    // Put at beginning of regular post list
                    postList.unshift(x);
                    indexes.push(i);
                } else {
                    return x;
                }
            });

            return postList;
        };

        var getPostTable = function() {
            var now = Date.now();
            for (var slug in futurePostTable) {
                if (futurePostTable[slug].date <= now) {
                    postTable[slug] = futurePostTable[slug];
                }
            }

            return postTable;
        };

        routes(app, getPostTable, getPostList);
        callback(app, getPostTable, getPostList);
    });
};

// Exports
exports.scan = scan;