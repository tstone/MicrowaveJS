
//
//  Microwave.js Jakefile
//  Do Cool Stuff From the Command Line™
//

var path        = require('path'),
    fs          = require('fs'),
    settings    = require('./src/settings'),
    scanner     = require('./src/scanner'),
    lib         = require('./src/lib'),
    googlespell = require('googlespell'),
    spell       = new googlespell.Checker({ threshold: 0 }),
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
// SPELLCHECK: Namespace

namespace('spellcheck', function(){

    var spellcheck = function(file) {
        var post = scanner.parseBlogPostFile(file),
            body = post.body;

        // Remove code from spellchecking
        body = body.replace(/<code[^>]+>[\s\S]*?<\/code>/gi, '');
        // Remove all HTML tags
        body = body.replace(/<[^>]+>/gi, '');

        spell.check(body, function(err, res) {
            print('Checking "' + post.title + '":');
            res.suggestions.forEach(function(x, i){
                print('');
                print((i+1) + '). [' + x.word + ']  From "...' + x.context + '..."');
                print('    Possibilities: ' + x.words.join(', '));
            });
        });

    };

    desc('Spellcheck the latest post');
    task('latest', function(){

        // Scan dir for last edited post
        var lastMod = Date.parse('January 1, 1970'),
            latest = '';
        fs.readdirSync(postDir).forEach(function(f){
            var file = path.join(postDir, f),
                stat = fs.statSync(file);

            if (stat.mtime > lastMod) {
                lastMod = stat.mtime;
                latest = file;
            }
        });

        spellcheck(latest);

    });

});

//
// TAGS: Namespace

namespace('tags', function(){

    desc('List all tags used on this blog');
    task('list', function(count){
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
            if (count) {
                print('Tags Used ' + count + ' Times:');
            } else {
                print('Tags:');
            }
            print('-----');

            var printed = 0;
            tags.forEach(function(tag){
                var show = count ? tagCounts[tag] >= count : true;
                if (show) {
                    print(tag + ' (' + tagCounts[tag] + ')');
                    printed++;
                }
            });

            if (printed === 0) { print('none'); }
        });
    });


    // This isn't quite working
    desc('Replace [tag1] with [tag2]');
    task('replace', function(tag1, tag2){
        //

        fs.readdir(postDir, function(err, files){
            files.forEach(function(f){
                var filePath = path.join(postDir, f),
                    text = fs.readFileSync(filePath).toString(),
                    tagPattern = new RegExp('(/*[\\S\\s]*?tags:[\\s]*\\[?[^]]*)' + tag1 + '([^]]*\\]?[\\S\\s]*?\\*/)', 'i');

                text = text.replace(tagPattern, '$1' + tag2 + '$2');
                console.log(text);
            });
        });
    });

});