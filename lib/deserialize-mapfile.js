'use strict';

var fs      =  require('fs')
  , path    =  require('path')
  , convert =  require('convert-source-map')

/**
 * Resolves the source map found inside the source map file
 * that is referenced inside the given cssFile.
 *
 * @name exports
 * @function
 * @param cssFile {String} full path to css file that contains the sourcemap comment that points to the .css.map file
 * @param cb {Function} called back with a convert-source-map object (https://github.com/thlorenz/convert-source-map#api) or an error
 */
var go = module.exports = function (cssFile, cb) {
  var dir = path.dirname(cssFile);  
  fs.readFile(cssFile, 'utf8',  function (err, css) {
    if (err) return cb(err);
    var conv = convert.fromMapFileSource(css, dir);
    cb(null, conv)
  });
};
