
var path        = require('path'),
    express     = require('express'),
    bundleUp    = require('bundle-up'),
    app         = express.createServer(),
    settings    = require('./settings'),
    scanner     = require('./scanner'),
    publicPath  = path.join(__dirname, '../public/')    ;

// Configure Bundled Assets
bundleUp(app, __dirname + '/assets', {
    staticRoot:     publicPath,
    staticUrlRoot:  '/public/',
    bundle:         true,
    minifyCss:      true,
    minifyJs:       true
});

// Configure Express
app.settings = settings;
app.configure(function() {
    app.use('/public', express['static'](publicPath));      // Linter freaks out @ express.static
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