'use strict';

var fs      =  require('fs')
  , path    =  require('path')
  , asyncReduce = require('asyncreduce')

/**
 * Resolves the source map found inside the source map file
 * that is referenced inside the given cssFile.
 *
 * Resolves sources contents of all .scss files found inside the sources property of the source map file and adds them to the source map.
 * Therefore calling this function alters the state of the passed conv to include the extra information.
 * 
 * @name resolveScssSources
 * @function
 * @private
 * @param {string}    root path to resolve .scss files relative to  
 * @param {Object}    conv convert-source-map object (https://github.com/thlorenz/convert-source-map#api) 
 * @param {function}  cb   called back with an error or null
 */
var go = module.exports = function (root, conv, cb) {

  var fullPathSources = conv
    .getProperty('sources')
    .map(function (s) { return path.resolve(root, s) });

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
        cb(null);
      }
  );   
};
