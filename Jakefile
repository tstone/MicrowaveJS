
//
//  Microwave.js Jakefile
//  Do Cool Stuff From the Command Line™
//

var path        = require('path'),
    fs          = require('fs'),
    settings    = require('./src/settings').getSettings(),
    lib         = require('./src/lib'),
    postDir     = path.join(__dirname, settings.posts);

require('./src/vendor/date');

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
    });

});