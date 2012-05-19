
var express     = require('express')
  , app         = express.createServer()
  , settings    = require('./settings')
  , scanner     = require('./scanner')
  , sitemap     = require('sitemap')
  ;

scanner.scan(settings, function(postKeyTable, postList) {

    app.get('/sitemap.xml', function(req, res){
        var host = settings.host;
        var sm = sitemap.createSitemap({
            hostname: host,
            urls: postList.map(function(p){
                return { url: '/' + p.slug };
            })
        });
        sm.toXML(function(xml){
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        });
    });

    app.get('/page/:num', function(req, res){

    });

    app.get('/*', function(req, res){
        console.log(req.url);
        res.send('');
    });

    app.get('/', function(req, res){
        // List all posts
    });

    app.listen(process.env.PORT || 3000);
})