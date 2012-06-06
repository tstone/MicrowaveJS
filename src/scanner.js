require('./vendor/date')

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
        header.tags = config.tags ? config.tags.map(function(x) { return x.toLowerCase(); }) : [];
        header.date = Date.parse(config.date);
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
    header.slug = slugify(header.title);

    return header;
};


//
// :: Render Body -> Format blog post in proper HTML

var renderBody = function(raw, format) {
    var addPrettifyHints = function(html) {
        html = html.replace(/<pre><code>/gi, '<pre class="prettyprint linenums" tabIndex="0"><code data-inner="1">');
        html = html.replace(/<code>/gi, '<code class="prettyprint" tabIndex="0">');
        html = html.replace(/\s<\/code>/gi, '</code>');
        return html;
    };

    if (format === 'md' || format === 'markdown') {             // Markdown
        // Convert github style code into regular markdown
        if (raw.indexOf('```') > -1) {
            var githubCodeBlockPattern = new RegExp('```([\\s\\S]+)```', 'g');
            var m = githubCodeBlockPattern.exec(raw);
            while (m) {
                var lines = m[1].split('\n');
                raw = raw.replace(m[0], lines.reduce(function(acc, x){
                    return acc + '\n    ' + x;
                }, ''));
                m = githubCodeBlockPattern.exec(raw);
            }
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
      , postList = []
      , postDir = path.join(__dirname, '../', settings.posts)
      ;

    fs.readdir(postDir, function(err, files){
        files.forEach(function(f){
            var filePath = path.join(__dirname, '../', settings.posts, f)
              , post = parseBlogPostFile(filePath, f);
            if (postTable[post.slug]){
                console.warn('An entry for slug "' + post.slug + '" already exists!');
            } else {
                // Data is stored in two formats
                // First, a "full details" table, in which posts are indexed by their slug
                postTable[post.slug] = post;
                // Seconed, an ordered list with only the minimal amount of information
                postList.push({
                    slug: post.slug,
                    date: post.date
                });
            }
        });

        // Sort list
        postList.sort(function(a, b){
            return b.date - a.date;
        });

        routes(app, postTable, postList);
        callback(app, postTable, postList);
    });
};

// Exports
exports.scan = scan;