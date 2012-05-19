var sitemap     = require('sitemap')
  , date        = require('./vendor/date')

exports.routes = function(app, postKeyTable, postList) {
    var settings = app.settings
      , indexRoute = function(req, res, page) {
            res.render('index.html', {
                locals: {
                    'pagetitle': settings.title,
                    'analytics': settings.analytics,
                    'posts': postList.map(function(x){
                        return { title: x.title, tags: x.tags, date: x.date.toString('MMMM d, yyyy h:mm tt') };
                    })
                }
            });
        };

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
        indexRoute(req, res, req.params['num']);
    });

    app.get('/*', function(req, res){
        if (req.url === '/') {
            indexRoute(req, res, '0');
        } else {
            var post = postKeyTable[req.url.substr(1)];
            if (post) {
                scanner.renderContent(post, function(content){
                    res.send(content);
                });
            } else {
                // TODO: 404
            }
        }
    });
};