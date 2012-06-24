
var fs      = require('fs'),
    path    = require('path');


var getThemeHead = exports.getThemeHead = function() {

    var html = fs.readFileSync(path.join(__dirname, '../public/theme/head.html'), 'utf8');

    // Remove relative <link> and <script> tags
    html = html.replace(/<link[^>]*href="(\/public[^"]+)"[^>]*>/gi, '');
    html = html.replace(/<script[^>]*src="(\/public[^"]+)"[^>]*>/gi, '');

    return html;
};