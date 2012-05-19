require('./vendor/date')

var path        = require('path')
  , fs          = require('fs')
  , yaml        = require('js-yaml')
  , markdown    = require('YamYam')
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
            var html = markdown.parse(body);
            // TODO: Convert stackoverflow style inline `code`
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
            return b.date > a.date;
        });

        routes(app, postKeyTable, postList, postDir);
        callback(postKeyTable, postList, postDir);
    });
};

// Exports
exports.parseContent = parseContent;
exports.renderContent = renderContent;
exports.scan = scan;