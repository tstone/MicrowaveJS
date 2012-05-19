var mustache    = require("./vendor/mustache.js")
  , path        = require('path')
  , fs          = require('fs')

var tmpl = {
    compile: function (source, options) {
        console.log('compile tmpl');
        if (typeof source == 'string') {
            return function(options) {
                console.log('compile f');
                options.locals = options.locals || {};
                options.partials = options.partials || {};
                if (options.body)
                    locals.body = options.body;
                return mustache.to_html(
                    source, options.locals, options.partials);
            };
        } else {
            return source;
        }
    },
    render: function (template, options) {
        console.log('render');
        template = this.compile(template, options);
        options.partials = options.partials || {};
                        // Make sure head is always on there
                if (!options.partials.head) {
                    options.partials['head'] = this.loadPartial('head');
                }

        return template(options);
    },
    loadPartial: function(name) {
        var partialPath = path.join(__dirname, 'views', '_' + name + '.html')
          , html = fs.readFileSync(partialPath, 'ascii')
          ;
        return html;
    }
};

exports.compile = tmpl.compile;
exports.render = tmpl.render;
exports.loadPartial = tmpl.loadPartial;