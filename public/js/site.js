

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

}());