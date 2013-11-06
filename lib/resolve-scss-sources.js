'use strict';

var fs      =  require('fs')
  , path    =  require('path')
  , convert =  require('convert-source-map')
  , asyncReduce = require('asyncreduce')
  ;

/**
 * Resolves the source map found inside the source map file
 * that is referenced inside the given cssFile.
 *
 * Resolves sources contents of all .scss files found inside the sources property of the source map file and adds them to the source map.
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
    var sourceMap = conv.toObject();

    var fullPathSources = sourceMap.sources.map(function (s) {
      return path.resolve(dir, s);  
    });

    asyncReduce(
        fullPathSources 
      , []
      , function (acc, source, cb_) {
          fs.readFile(source, 'utf8',  function (err, src) {
            if (err) return cb_(err);
            acc.push(src);
            cb_(null, acc);
          });
        }
      , function (err, acc) {
          if (err) return cb(err);
          conv.setProperty('sourcesContent', acc);
          cb(null, conv);
        }
    );   
    
  });
};
