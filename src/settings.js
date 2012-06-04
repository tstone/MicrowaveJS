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

	return settings;
};