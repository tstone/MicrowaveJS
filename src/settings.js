var path        = require('path')
  , fs          = require('fs')
  , yaml        = require('js-yaml')
  ;

exports.getSettings = function() {

	var settingsPath = path.join(__dirname,'../settings.yml');
	var rawYaml = fs.readFileSync(settingsPath, 'ascii');
	var settings = rawYaml ? yaml.load(rawYaml) : {};

	// Make setting names all lower case
	for (var prop in settings) {
		if (settings.hasOwnProperty(prop)) {
			settings[prop.toLowerCase()] = settings[prop];
		}
	}

	// Add on a couple of convenience properties
	var isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
	settings.domain = settings.host.replace(/http[s]?:\/\//i, '');
	settings.env = {
		production: isProd,
		debug: !isProd
	};

	// Clean up settings
	// Remove @ from twitter handle
	if (settings.twittername && settings.twittername.substr(0, 1) === '@') {
		settings.twittername = settings.twittername.substr(1);
	}

	return settings;
};