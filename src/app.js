
var express     = require('express')
  , app         = express.createServer()
  , settings    = require('./settings')
  , scanner     = require('./scanner')
  , tmpl        = require('./vendor/mustache')
  , path        = require('path')
  ;

// Configure
app.settings = settings;
app.configure(function(){
    app.use(app.router);
    app.set('views', path.join(__dirname, '/views'));
    app.set('view options', { layout: false });
    app.register('.html', tmpl);
});

// Scan and start
scanner.scan(app, settings, require('./routes').routes, function() {
    app.listen(process.env.PORT || 3000);
});