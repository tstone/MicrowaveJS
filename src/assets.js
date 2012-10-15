
var path 	 = require('path'),
	settings = require('./settings');


module.exports = function(assets) {

    assets.root = path.join(__dirname, '../theme/');
    
    // JS
    assets.addJs('*.js');
    assets.addJs('js/*.js');
    assets.addJs('theme/*.js');
    assets.addJs('theme/js/*.js');

};