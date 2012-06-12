
var middleware = {};


//
// :: Single Route Middleware(s)

middleware.forcehost = exports.forcehost = function(req, res, next) {
	var settings = req.app.settings;
	if (settings.env.production && settings.forcehost && req.headers.host !== settings.domain) {
		res.writeHead(301, { 'Location': settings.host + req.originalUrl });
		res.end();
	} else {
		next();
	}
};


middleware.locals = exports.locals = function(req, res, next) {

	// Redefine render
	var render = res.render;
	res.render = function(view, options, fn) {
		if (typeof options.bodyClass === 'undefined') {
			options.bodyClass = view;
		}
		render.apply(res, [view, options, fn]);
	};

	next();
};


middleware.pjax = exports.pjax = function(req, res, next) {
	// Inspect header for Pjax signature
	if (req.header('X-PJAX')) {
		req.pjax = true;
	}

	// Redefine render
	var render = res.render;
	res.render = function(view, options, fn) {
		
		if (req.pjax) {
			view = '_' + view;
		}
		render.apply(res, [view, options, fn]);
	};

	next();
};


//
// :: Route Middleware Groups

exports.content = [
	middleware.forcehost,
	middleware.locals,
	middleware.pjax
];