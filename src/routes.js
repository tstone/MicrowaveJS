var sitemap     = require('sitemap')
  , scanner     = require('./scanner')
  , date        = require('./vendor/date')
  , slugify     = require('./lib').slugify
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
                        date: x.date.toString('MMMM d, yyyy'),
                        url: '/post/' + x.slug
                    };
                })
            });
        };

    app.get('/post/*', function(req, res){
        var url = req.url.substr(6)
          , post = postKeyTable[url];

        if (post) {
            scanner.renderContent(post, function(body, header){
                var slug = slugify(header.title);
                res.render('post',{
                    title: header.title,
                    slug: slug,
                    body: body,
                    url: '/post/' + slug,
                    disqusname: app.settings.disqusname
                });
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