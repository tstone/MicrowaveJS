
var express     = require('express')
  , app         = express.createServer()
  , settings    = require('./settings')
  , scanner     = require('./scanner')
  , consolidate = require('consolidate')
  , path        = require('path')
  ;

// Configure Express
app.engine('dust', consolidate.dust);
app.settings = settings;
app.configure(function(){
    app.use('/public', express.static(path.join(__dirname, '../public')));
    app.set('view engine', 'dust');
    app.set('views', path.join(__dirname, '/views'));
    app.use(app.router);
});

// Scan and start
scanner.scan(app, settings, require('./routes').routes, function() {
    app.listen(process.env.PORT || 3000);
});