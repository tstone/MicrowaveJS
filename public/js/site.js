

(function() {

    /* ==> HTTP
           Helpers for doing http stuff. */

    var http = {
        // http.async
        async: true,
        // http.get
        get: function(url, callback, errback) {
            try {
                var xhr = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
                if (xhr) {
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) { callback(xhr.responseText); }
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
                fallback = function() { document.location.href = el.getAttribute('href'); };

            // Hit server via AJAX to get page content
            http.get(href, function(res) {
                var settings = el.getAttribute('data-pjax').split('/');
                var target = document.querySelectorAll(settings[1])[0];
                if (target) {
                    
                    // Setup body class name
                    body.setAttribute('class', settings[0]);
                    
                    // Extract script tags
                    var scripts = [];
                    var regex = new RegExp('<script[^>]*>([\\S\\s]+)</script>', 'gi');
                    var match = regex.exec(res);
                    while (match) {
                        scripts.push(match[1]);
                        res = res.replace(match[0], '');
                        match = regex.exec(res);
                    }
                    target.innerHTML = res;

                    // Now re-insert script tags so they'll be executed
                    scripts.forEach(function(x){
                        var s = document.createElement('script');
                        s.text = x;
                        console.log(x);
                        target.parentNode.insertBefore(s, target.nextSibling);
                    });

                    // Manually activate syntax highlighting
                    if (prettyPrint) { prettyPrint(); }

                    // Push state
                    history.pushState({}, '', href);

                    // Record state change as a google analytics page view
                    if (window.gaq) {
                        gaq.push(['_trackPageview']);
                    }
                } else {
                    fallback();
                }
            }, fallback);
        }
    };


    /*  ==> Event Handlers
            Making things on the page do stuff  */

    // Map search box
    var box = document.getElementById('search-box');
    box.onkeypress = function(e) {
        if (e.keyCode === 13) {
            document.location.href = '/search/' + encodeURI(box.value);
        }
    };

    // Map pjax click handlers
    if (document.querySelectorAll && history.pushState) {
        var body = document.getElementsByTagName('body')[0];
        body.onclick = function(e) {
            var el = e.target;
            if (el.getAttribute('data-pjax')) {
                http.pjax(el);
                return false;
            } else {
                return true;
            }
        };
    }

}());