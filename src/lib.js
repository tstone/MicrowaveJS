
exports.slugify = function(s) {
    return s ? s.trim().toLowerCase().replace(/[^-a-z0-9,&\s]+/ig, '').replace(/\s/g, '-') : '';
};