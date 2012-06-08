
(function(){

	// Map search box
    var box = document.getElementById('search-box');
    box.onkeypress = function(e) {
        if (e.keyCode === 13) {
            document.location.href = '/search/' + encodeURI(box.value);
        }
    };

}());