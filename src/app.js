
var express     = require('express'),
    app         = express.createServer(),
    settings    = require('./settings'),
    scanner     = require('./scanner'),
    path        = require('path');

// Configure Express
app.settings = settings;
app.configure(function() {
    app.use('/public', express.static(path.join(__dirname, '../public')));
    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, '/views'));
    app.use(app.router);

    // Values available to every template
    app.locals({
        analytics:        settings.analytics || '',
        analyticsDomain:  settings.analyticsdomain || '',
        blogDesc:         settings.desc || '',
        blogTitle:        settings.title || 'MicrowaveJS Blog',
        comments:         settings.comments,
        disqusName:       settings.disqusname,
        facebookSharing:  settings.facebooksharing,
        googleSharing:    settings.googlesharing,
        hackerNewsSharing: settings.hackernewssharing,
        host:             settings.host,
        sharing:          settings.sharing,
        twitterSharing:   settings.twittersharing
    });
});

// Scan and start
scanner.scan(app, settings, require('./routes').routes, function() {
    app.listen(process.env.PORT || 3000);
});