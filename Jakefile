
//
//  Microwave.js Jakefile
//  Do Cool Stuff From the Command Line™
//

var path        = require('path'),
    fs          = require('fs'),
    settings    = require('./src/settings'),
    scanner     = require('./src/scanner'),
    lib         = require('./src/lib'),
    postDir     = path.join(__dirname, settings.posts);

require('./src/vendor/date');
console.log('');

var print = function(s) {
    console.log('  ' + s);
};

//
//  POST: Namespace

namespace('post', function() {

    desc('Create a new post stub');
    task('new', [], function(title){

        if (!title || title.length === 0) {
            console.log('Please enter a title!');
            return;
        }

        var slug = lib.slugify(title);
        var post = lib.string(
                '/*',
                'Title:    ' + title,
                'Date:     ' + Date.now().toString('MMMM d, yyyy h:mm'),
                '*/',
                '',
                '...'
            );

        var file = path.join(postDir, slug+'.md');
        fs.writeFileSync(file, post);

        print(file + ' was created!');
    });

});


//
// TAGS: Namespace

namespace('tags', function(){

    desc('List all tags used on this blog');
    task('list', function(){
        scanner.scan(this, settings, function(that, getPostTable, getPostList) {
            // Gather all tags
            var tags = [];
            var tagCounts = {};
            var posts = getPostTable();
            for (var slug in posts) {
                var post = posts[slug];
                post.tags.forEach(function(tag){
                    if (tags.indexOf(tag) === -1) { tags.push(tag); }
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }

            // Sort by alpha
            tags.sort();

            // Print
            print('Tags:');
            print('-----');

            var text = tags.map(function(tag){
                return tag + ' (' + tagCounts[tag] + ')';
            }).join(', ').trim();
            print(text);
        });
    });

});