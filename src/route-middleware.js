
var middleware = {};


//
// :: Single Route Middleware(s)

middleware.locals = exports.locals = function(req, res, next) {
	// Redefine render
	var render = res.render;
	res.render = function(view, options, fn) {
		options.bodyClass = view;
		render.apply(res, [view, options, fn]);
	};

	next();
};

// Comming Soon!
middleware.pjax = exports.pjax = function(req, res, next) {
	// Inspect header for Pjax signature
	if (req.header('X_PJAX"')) {
		req.pjax = true;
	}

	// Redefine render
	var render = res.render;
	res.render = function(view, options, fn) {		
		if (req.pjax) {
			options.layout = false;
		}
		render.apply(res, [view, options, fn]);
	};

	next();
};


//
// :: Route Middleware Groups

exports.content = [
	middleware.locals
//, middleware.pjax
];