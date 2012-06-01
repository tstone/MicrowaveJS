var sitemap     = require('sitemap')
  , scanner     = require('./scanner')
  , fs          = require('fs')
  , path        = require('path')
  , date        = require('./vendor/date')
  , slugify     = require('./lib').slugify
  , RSS         = require('rss')
  ;

exports.routes = function(app, postTable, postList) {
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
                analytics: settings.analytics,
                analyticsdomain: settings.analyticsdomain || '',
                disqusname: settings.disqusname,
                page: page,
                prev: pageLeft ? '/page/' + page : '',
                next: pageRight ? '/page/' + (page+2) : '',
                prevText: settings.prev,
                nextText: settings.next,
                pagination: pageLeft && pageRight,
                comments: settings.comments,
                posts: posts.map(function(x) {
                    var post = postTable[x.slug];
                    return {
                        title: post.title,
                        tags: post.tags,
                        date: post.date.toString('MMMM d, yyyy'),
                        url: '/post/' + post.slug,
                        slug: post.slug
                    };
                })
            });
        };

    app.get('/post/*', function(req, res){
        var slug = req.url.substr(6)
          , post = postTable[slug];

        if (post) {
            res.render('post',{
                head: head,
                analytics: settings.analytics,
                analyticsdomain: settings.analyticsdomain || '',
                blogtitle: settings.title,
                blogdesc: settings.desc,
                title: post.title,
                slug: slug,
                body: post.body,
                date: post.date.toString('MMMM d, yyyy'),
                tags: post.tags,
                url: '/post/' + slug,
                disqusname: app.settings.disqusname,
                comments: typeof post.comments === 'boolean' ? post.comments : settings.comments
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

    app.get('/tagged/:tag', function(req, res){
        var tag = req.params['tag'].toLowerCase()
          , results = []
          ;
        // Search posts
        postList.forEach(function(p){
            var post = postTable[p.slug];
            if (post.tags.indexOf(tag) !== -1) {
                results.push(post);
            }
        });
        // Render
        res.render('index', {
            blogtitle: settings.title,
            blogdesc: 'Posts tagged "' + tag + '"',
            comments: settings.comments,
            disqusname: settings.disqusname,
            head: head,
            page: 0,
            pagination: false,
            posts: results.map(function(x){
                return {
                    title: x.title,
                    tags: x.tags,
                    date: x.date.toString('MMMM d, yyyy'),
                    url: '/post/' + x.slug,
                    slug: x.slug
                };
            })
        });
    });

    app.get('/rss', function(req, res){
        var feedConf = {
            title: settings.title,
            feed_url: settings.host + '/rss',
            site_url: settings.host
        };

        if (settings.desc) { feedConf.description = settings.desc; }
        if (settings.author) { feedConf.author = settings.author; }

        var feed = new RSS(feedConf);

        postList.forEach(function(p){
            var post = postTable[p.slug];
            feed.item({
                title: post.title,
                url: settings.host + '/post/' + post.slug,
                guid: post.slug,
                author: settings.author || '',
                date: post.date.toString()
            });
        });

        res.header('Content-Type', 'application/rss+xml');
        res.send(feed.xml());
    });

    app.get('/sitemap.xml', function(req, res){
        var host = settings.host;
        var sm = sitemap.createSitemap({
            hostname: host,
            urls: postList.map(function(p) {
                return { url: settings.host + '/post/' + p.slug };
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