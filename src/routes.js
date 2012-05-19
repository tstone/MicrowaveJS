var sitemap     = require('sitemap')
  , scanner     = require('./scanner')
  , date        = require('./vendor/date')
  , tmpl        = require('./tmpl')
  ;

exports.routes = function(app, postKeyTable, postList) {
    var settings = app.settings
      , indexRoute = function(req, res, page) {
            res.render('index', {
                'pagetitle': settings.title,
                'analytics': settings.analytics,
                'posts': postList.map(function(x){
                    return {
                        title: x.title,
                        tags: x.tags,
                        date: x.date.toString('MMMM d, yyyy h:mm tt'),
                        url: '/post/' + x.slug
                    };
                })
            });
        };

    app.get('/post/*', function(req, res){
        var url = req.url.substr(6)
          , post = postKeyTable[url];

        if (post) {
            scanner.renderContent(post, function(content){
                res.send(content);
            });
        } else {
            // TODO: 404
        }
    });

    app.get('/page/:num', function(req, res){
        indexRoute(req, res, req.params['num']);
    });

    app.get('/sitemap.xml', function(req, res){
        var host = settings.host;
        var sm = sitemap.createSitemap({
            hostname: host,
            urls: postList.map(function(p){
                return { url: '/post/' + p.slug };
            })
        });
        sm.toXML(function(xml){
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        });
    });

    app.get('/', function(req, res){
        indexRoute(req, res, '0');
    });
};