var sitemap     = require('sitemap')
  , scanner     = require('./scanner')
  , fs          = require('fs')
  , path        = require('path')
  , date        = require('./vendor/date')
  , slugify     = require('./lib').slugify
  , RSS         = require('rss')
  , head        = fs.readFileSync(path.join(__dirname, '../public/theme/head.html'))
  , defaultVal  = function(dict, key, value) { if (typeof dict[key] === 'undefined') { dict[key] = value; } }
  ;

exports.routes = function(app, postTable, postList) {
    var settings = app.settings
      , commonRender = function(res, template, context) {
            // Add-in common values if not present
            defaultVal(context, 'analytics', settings.analytics || '')
            defaultVal(context, 'analyticsdomain', settings.analyticsdomain || '')
            defaultVal(context, 'blogdesc', settings.desc || '')
            defaultVal(context, 'blogtitle', settings.title || 'MicrowaveJS Blog')
            defaultVal(context, 'comments', settings.comments)
            defaultVal(context, 'disqusname', settings.disqusname)
            defaultVal(context, 'head', head)
            defaultVal(context, 'host', settings.host)
            res.render(template, context);
        }
      , index = function(req, res, page) {
            // Setup pagination
            var offset = settings.count * page;
            var offsetEnd = offset + settings.count;
            var posts = postList.slice(offset, offsetEnd);
            var pageLeft = offset > 0;
            var pageRight = offsetEnd < postList.length;

            // Render
            commonRender(res, 'index', {
                page: page,
                prev: pageLeft ? '/page/' + page : '',
                next: pageRight ? '/page/' + (page+2) : '',
                prevText: settings.prev,
                nextText: settings.next,
                posts: posts.map(function(x) {
                    var post = postTable[x.slug];
                    return {
                        title: post.title,
                        tags: post.tags,
                        date: post.date.toString(settings.posttimeformat),
                        url: settings.host + '/post/' + post.slug,
                        slug: post.slug
                    };
                })
            });
        }
      ;


    //
    // GET /post/:slug

    app.get('/post/*', function(req, res){
        var slug = req.url.substr(6)
          , post = postTable[slug];

        if (post) {
            commonRender(res, 'post', {
                body: post.body,
                comments: typeof post.comments === 'boolean' ? post.comments : settings.comments,
                date: post.date.toString(settings.posttimeformat),
                slug: slug,
                tags: post.tags,
                title: post.title,
                url: settings.host + '/post/' + slug
            });
        } else {
            res.render('404', {
                url: url
            });
        }
    });


    //
    // GET /tagged/:tag

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
        commonRender(res, 'index', {
            page: 0,
            pagination: false,
            posts: results.map(function(x){
                return {
                    title: x.title,
                    tags: x.tags,
                    date: x.date.toString(settings.posttimeformat),
                    url: '/post/' + x.slug,
                    slug: x.slug
                };
            })
        });
    });


    //
    // GET /rss

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


    //
    // GET /sitemap.xml

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


    //
    // GET /page/:num

    app.get('/page/:num', function(req, res){
        index(req, res, parseInt(req.params['num']) - 1);
    });


    //
    // GET /

    app.get('/', function(req, res){
        index(req, res, 0);
    });
};