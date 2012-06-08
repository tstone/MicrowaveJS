

(function() {

    /* ==> DOM
           Stuff to abstract over IE's lack of standards  */

    var dom = {
        bind: function(el, ev, callback) {
            if (el.addEventListener) {
                el.addEventListener(ev, callback, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + ev, callback);
            }
        }
    };

    /* ==> HTTP
           Helpers for doing http stuff.  */

    var http = {
        // http.async
        async: true,

        // http.cache
        cache: { },
        
        // http.get
        get: function(url, callback, errback, cache) {
            // Check if this request has been cached before
            if (cache && http.cache[url]) { callback(cache[url]); return; }
            try {
                var xhr = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
                if (xhr) {
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            http.cache[url] = xhr.responseText;
                            callback(xhr.responseText);
                        }
                    };
                    xhr.open('GET', url, http.async);
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    xhr.setRequestHeader('X-PJAX', 'true');
                    xhr.send();
                }
            } catch (ex) {
                errback();
            }
        },

        // http.pjax
        pjax: function(el) {
            var body = document.getElementsByTagName('body')[0],
                href = el.getAttribute('href'),
                fallback = function() {
                    document.location.href = el.getAttribute('href');
                };

            // Hit server via AJAX to get page content
            http.get(href, function(res) {
                var settings = el.getAttribute('data-pjax').split('/'),
                    bodyClass = settings[0],
                    selector = settings[1],
                    target = document.querySelectorAll(settings[1])[0];
                
                if (target) {
                    
                    // Extract script tags
                    var scripts = [];
                    var regex = new RegExp('<script[^>]*>([\\S\\s]+)</script>', 'gi');
                    var match = regex.exec(res);
                    while (match) {
                        scripts.push(match[1]);
                        res = res.replace(match[0], '');
                        match = regex.exec(res);
                    }
                    
                    // Insert content (preserve height to avoid jumpyness)
                    var h = target.clientHeight || target.offsetHeight;
                    target.setAttribute('style', 'height: ' + h + 'px;');
                    body.setAttribute('class', settings[0]);
                    target.innerHTML = res;
                    target.setAttribute('style', 'height: auto;');
                    
                    // Now re-insert script tags so they'll be executed
                    scripts.forEach(function(x){
                        var s = document.createElement('script');
                        s.text = x;
                        target.parentNode.insertBefore(s, target.nextSibling);
                    });

                    // Manually activate syntax highlighting
                    if (prettyPrint) { prettyPrint(); }

                    // Push state
                    history.pushState({ bodyClass: bodyClass, selector: selector, html: res }, '', href);

                    // Record state change as a google analytics page view
                    if (window.gaq) { gaq.push(['_trackPageview']); }
                } else {
                    fallback();
                }
            }, fallback, true);
        }
    };


    /*  ==> Event Handlers
            Making things on the page do stuff.  */

    // Map search box
    var search = function(s) {
        document.location.href = '/search/' + encodeURI(s);
    };

    var searchBox = document.getElementById('search-box');
    dom.bind(searchBox, 'keypress', function(e) {
        if (e.keyCode === 13) {
            search(searchBox.value);
            return false;
        }
    });
    var searchBtn = document.getElementById('search-btn');
    dom.bind(searchBtn, 'click', function(e) {
        search(searchBox.value);
        return false;
    });


    // Map pjax click handlers
    if (document.querySelectorAll && history.pushState) {
        var body = document.getElementsByTagName('body')[0];
        body.addEventListener('click', function(e) {
            var el = e.target;
            if (el.getAttribute('data-pjax')) {
                http.pjax(el);
                return false;
            } else {
                return true;
            }
        });

        // Handle popstate
        window.addEventListener('popstate', function(e) {
            console.log(e);
        });
    }


}());