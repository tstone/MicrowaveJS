
var express     = require('express')
  , app         = express.createServer()
  , settings    = require('./settings')
  , scanner     = require('./scanner')
  , sitemap     = require('sitemap')
  ;

scanner.scan(settings, function(postKeyTable, postList) {

    console.log(postKeyTable);

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
        var post = postKeyTable[req.url.substr(1)];
        if (post) {
            scanner.renderContent(post, function(content){
                res.send(content);
            });
        } else {
            // 404
        }
    });

    app.get('/', function(req, res){
        // List all posts
    });

    app.listen(process.env.PORT || 3000);
})