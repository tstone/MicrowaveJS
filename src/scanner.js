require('./vendor/date')

var path        = require('path')
  , fs          = require('fs')
  , yaml        = require('js-yaml')
  , showdown    = require('./vendor/showdown')
  , markdown    = new showdown.converter()
  , slugify     = require('./lib').slugify
  , scanner     = {}
  ;

var sliceContents = function(contents) {
    var i = contents.indexOf('*/');
    return {
        header: contents.substr(2, i - 2).trim(),
        body: contents.substr(i + 2).trim()
    }
};

/* ----------------------------------
    parseHeader
    Read the meta data (YAML) at the top of a file
    ---------------------------------- */
var parseHeader = function(file, name) {
    var header = {
        tags: []
    };
    var contents = fs.readFileSync(file, 'ascii').trim();

    // Check for configuration data
    if (contents.substr(0, 2) === '/*') {
        var rawConfig = sliceContents(contents);
        if (rawConfig.header) {
            var config = yaml.load(rawConfig.header);
            header.title = config.title;
            header.tags = config.tags;
            header.date = Date.parse(config.date);
        }
    }

    // Fill in date if it's lacking
    if (typeof header.date === 'undefined') {
        var stats = fs.lstatSync(file);
        header.date = stats.ctime;
    }

    // Fill in title if it's lacking
    if (typeof header.title === 'undefined') {
        if (name.indexOf('.') > -1) {
            header.title = name.substr(0, name.lastIndexOf('.'));
        } else {
            header.title = name;
        }
    }

    // Generate slug
    header.slug = slugify(header.title);

    return header;
};

var parseContent = function(file, callback) {
    fs.readFile(file, 'ascii', function(err, raw){
        var post = sliceContents(raw.trim());
        callback(post.body, yaml.load(post.header));
    })
};

var renderContent = function(file, callback) {
    parseContent(file, function(body, header) {
        if (file.substr(file.length - 3) === '.md') {
            // Convert github style code into regular markdown
            if (body.indexOf('```') > -1) {
                var githubCodeBlockPattern = new RegExp('```([\\s\\S]+)```', 'g');
                var m = githubCodeBlockPattern.exec(body);
                while (m) {
                    var lines = m[1].split('\n');
                    body = body.replace(m[0], lines.reduce(function(acc, x){
                        return acc + '\n    ' + x;
                    }, ''));
                    m = githubCodeBlockPattern.exec(body);
                }
            }
            // Html -> Markdown
            var html = markdown.makeHtml(body);
            // Drop in Prettify Hints
            html = html.replace(/<pre><code>/gi, '<pre class="prettyprint linenums" tabIndex="0"><code data-inner="1">');
            html = html.replace(/<code>/gi, '<code class="prettyprint" tabIndex="0">');
            html = html.replace(/\s<\/code>/gi, '</code>');
            callback(html, header);
        } else {
            callback(body, header);
        }
    });
}


/* ----------------------------------
    scan
    Read the posts directory and build the cache
    of available posts
   ---------------------------------- */
var scan = function(app, settings, routes, callback) {

    var postKeyTable = {}
      , postList = []
      , postDir = path.join(__dirname, '../', settings.posts);

    fs.readdir(postDir, function(err, files){
        files.forEach(function(f){
            var filePath = path.join(__dirname, '../', settings.posts, f)
              , header = parseHeader(filePath, f);
            if (postKeyTable[header.slug]){ console.warn('An entry for slug "' + header.slug + '" already exists!'); }
            postList.push(header);
            postKeyTable[header.slug] = filePath;
        });

        // Sort list
        postList.sort(function(a, b){
            return b.date - a.date;
        });

        routes(app, postKeyTable, postList, postDir);
        callback(postKeyTable, postList, postDir);
    });
};

// Exports
exports.parseContent = parseContent;
exports.renderContent = renderContent;
exports.scan = scan;