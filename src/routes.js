
var sitemap     = require('sitemap')
  , middleware  = require('./route-middleware')
  , scanner     = require('./scanner')
  , fs          = require('fs')
  , path        = require('path')
  , date        = require('./vendor/date')
  , slugify     = require('./lib').slugify
  , RSS         = require('rss')
  , templates   = {}
  ;

//
// :: Define route handlers

exports.routes = function(app, getPostTable, getPostList) {
    var settings = app.settings;


    //
    // GET :: /post/:slug

    app.get('/post/*', middleware.content, function(req, res){
        var slug = req.url.substr(6)
          , url = '/post/' + slug
          , postList = getPostList()
          , postTable = getPostTable()
          , post = postTable[slug]
          , convertPost = function(post) { return {
                date: post.date.toString(settings.posttimeformat),
                title: post.title,
                url: '/post/' + post.slug
                };
            }
          ;

        // Find the next and previous post (if there is one)
        var postIndex = postList.reduce(function(acc, x, i){
            if (x.slug === slug) { return i; } return acc;
        }, -1);
        var prevPost = postIndex > 0 ? postTable[postList[postIndex - 1].slug] : undefined;
        var nextPost = postIndex < (postList.length - 1) ? postTable[postList[postIndex + 1].slug] : undefined;
        if (prevPost) { prevPost = convertPost(prevPost); }
        if (nextPost) { nextPost = convertPost(nextPost); }

        // Render
        if (post) {
            res.render('post', {
                body: post.body,
                comments: typeof post.comments === 'boolean' ? post.comments : settings.comments,
                date: post.date.toString(settings.posttimeformat),
                disqusurl: settings.host + url,
                nextPost: nextPost,
                prevPost: prevPost,
                slug: slug,
                tags: post.tags,
                title: post.title,
                url: url
            });
        } else {
            res.statusCode = 404;
            res.render('404', {
                url: url
            });
        }
    });


    //
    // GET :: /tagged/:tag

    app.get('/tagged/:tag', middleware.content, function(req, res){
        var tag = req.params['tag'].toLowerCase()
          , results = []
          ;
        
        // Search posts
        getPostList().forEach(function(p){
            var post = getPostTable()[p.slug];
            if (post.tags.indexOf(tag) !== -1) {
                results.push(post);
            }
        });
        
        // Render
        res.render('index', {
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
    // GET :: /rss

    app.get('/rss', middleware.forcehost, function(req, res){
        var feedConf = {
            title: settings.title,
            feed_url: settings.host + '/rss',
            site_url: settings.host
        };

        if (settings.desc) { feedConf.description = settings.desc; }
        if (settings.author) { feedConf.author = settings.author; }

        var feed = new RSS(feedConf)
          , postTable = getPostTable()
          ;

        getPostList().forEach(function(p){
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
    // GET :: /sitemap.xml

    app.get('/sitemap.xml', middleware.forcehost, function(req, res){
        var host = settings.host
          , postList = getPostList()
          ;
        var sm = sitemap.createSitemap({
            hostname: host,
            urls: postList.map(function(p) {
                return { url: settings.host + '/post/' + p.slug };
            })
        });
        // Too RSS
        sm.toXML(function(xml){
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        });
    });


    //
    // GET :: / -OR- /page/:num

    app.get('/(page/:num)?', middleware.content, function(req, res){
        var page = req.params['num'] ? parseInt(req.params['num'], 10) - 1 : 0;
        
        // Setup pagination
        var offset = settings.count * page
          , offsetEnd = offset + settings.count
          , postTable = getPostTable()
          , postList = getPostList()
          , posts = postList.slice(offset, offsetEnd)
          , pageLeft = offset > 0
          , pageRight = offsetEnd < postList.length
          ;

        // Render
        res.render('index', {
            page: page,
            pagination: pageLeft || pageRight,
            prev: pageRight ? '/page/' + (page+2) : '',
            next: pageLeft ? '/page/' + page : '',
            prevText: settings.prev,
            nextText: settings.next,
            posts: posts.map(function(x) {
                var post = postTable[x.slug];
                return {
                    date: post.date.toString(settings.posttimeformat),
                    disqusUrl: settings.host + '/post/' + post.slug,
                    slug: post.slug,
                    tags: post.tags,
                    title: post.title,
                    url: '/post/' + post.slug
                };
            })
        });
    });
};