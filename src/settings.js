var path        = require('path')
  , fs          = require('fs')
  , yaml        = require('js-yaml')
  ;

var settingsPath = path.join(__dirname,'settings.yml');
var rawYaml = fs.readFileSync(settingsPath, 'ascii');

module.exports = rawYaml ? yaml.load(rawYaml) : {};