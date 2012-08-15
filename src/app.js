
var path        = require('path'),
    express     = require('express'),
    bundleUp    = require('bundle-up'),
    app         = express(),
    settings    = require('./settings'),
    scanner     = require('./scanner'),
    theme       = require('./theme'),
    http        = require('http'),
    publicPath  = path.join(__dirname, '../public/');


// Bundled Assets
bundleUp(app, __dirname + '/assets', {
    staticRoot:     publicPath,
    staticUrlRoot:  '/public/',
    bundle:         settings.env.production,
    minifyCss:      settings.env.production,
    minifyJs:       settings.env.production
});

// Configure Express
app.settings = settings;
app.configure(function() {

    // Long cache assets if in production
    if (settings.env.production) {
        var oneYear = 31557600000;
        app.use('/public', express.static(publicPath, { maxAge: oneYear }));
    } else {
        app.use('/public', express.static(publicPath));
    }

    app.set('port', process.env.PORT || 3000);
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
        themeHead:        theme.getThemeHead(),
        twitterSharing:   settings.twittersharing
    });
});

// Scan and start
scanner.scan(app, settings, require('./routes').routes, function() {
    http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
});