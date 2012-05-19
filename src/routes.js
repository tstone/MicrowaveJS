var sitemap     = require('sitemap')
  , scanner     = require('./scanner')
  , fs          = require('fs')
  , path        = require('path')
  , date        = require('./vendor/date')
  , slugify     = require('./lib').slugify
  ;

exports.routes = function(app, postKeyTable, postList) {
    var settings = app.settings
      , head = fs.readFileSync(path.join(__dirname, '../public/theme/head.html'))
      , indexRoute = function(req, res, page) {
            // Setup pagination
            page = parseInt(page);
            var offset = settings.count * page;
            var offsetEnd = offset + settings.count;
            var posts = postList.slice(offset, offsetEnd);
            var pageLeft = offset > 0;
            var pageRight = offsetEnd < postList.length;

            res.render('index', {
                blogtitle: settings.title,
                blogdesc: settings.desc,
                head: head,
                disqusname: settings.disqusname,
                page: page,
                prev: pageLeft ? '/page/' + page : '',
                next: pageRight ? '/page/' + (page+2) : '',
                prevText: settings.prev,
                nextText: settings.next,
                pagination: pageLeft && pageRight,
                comments: settings.comments,
                posts: posts.map(function(x){
                    return {
                        title: x.title,
                        tags: x.tags,
                        date: x.date.toString('MMMM d, yyyy'),
                        url: '/post/' + x.slug,
                        slug: x.slug
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
                    head: head,
                    blogtitle: settings.title,
                    blogdesc: settings.desc,
                    title: header.title,
                    slug: slug,
                    body: body,
                    date: header.date,
                    tags: header.tags,
                    url: '/post/' + slug,
                    disqusname: app.settings.disqusname,
                    comments: typeof header.comments === 'boolean' ? header.comments : settings.comments
                });
            });
        } else {
            res.render('404', {
                url: url
            });
        }
    });

    app.get('/page/:num', function(req, res){
        indexRoute(req, res, parseInt(req.params['num']) - 1);
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