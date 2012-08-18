
var path = require('path');


module.exports = function(assets) {

    assets.root = path.join(__dirname, '../public/');

    // CSS
    assets.addCss('css/*.css');
    assets.addCss('theme/*.css');

    // JS
    assets.addJs('js/vendor/*.js');
    assets.addJs('js/site.js');
    assets.addJs('theme/*.js');

};