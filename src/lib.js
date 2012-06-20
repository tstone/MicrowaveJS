
// slugify
exports.slugify = function(s) {
    return s ? s.trim().toLowerCase().replace(/[^-a-z0-9,\s]+/ig, '').replace(/[&\s]+/g, '-') : '';
};

// titleize
// The opposite of slugify
exports.titleize = function(s) {
    if (!s) { return s; }
    var title = s.trim();

    // Remove - and _
    title = title.replace(/[-_]/g, ' ');
    // Capitalize first letters
    title = title.split(' ').reduce(function(acc, s){
        return s ? acc + s.substr(0, 1).toUpperCase() + s.substr(1) + ' ' : acc;
    }, '');

    return title.trim();
};

// filterPosts
// filters to be applied to posts array for
exports.filters = {
	// return posts that have publish dates in the past
	published: function(posts){
		return posts.filter(function(x){ 
			return x.date < (new Date());
		});
	}
};