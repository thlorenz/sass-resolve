'use strict';

var fs      =  require('fs')
  , path    =  require('path')
  , convert =  require('convert-source-map')
  , asyncReduce = require('asyncreduce')
  ;

var go = module.exports = function (cssFile, cb) {
  var dir = path.dirname(cssFile);  
  fs.readFile(cssFile, 'utf8',  function (err, css) {
    if (err) return cb(err);
    var conv = convert.fromMapFileSource(css, dir);
    
  });
};


function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

// Test
if (!module.parent) {
  var cb = function (err) { console.error(err); };

  var resolve = require('../');
  var testdir = path.join(__dirname, '..', 'test');
  var cssFile = path.join(testdir, 'css-with-sourcemaps', 'sample.css');

  var dir = path.dirname(cssFile);  
  var css = fs.readFileSync(cssFile, 'utf8');
  var conv = convert.fromMapFileSource(css, dir);  
  var sourceMap = conv.toObject();

  inspect(sourceMap);

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
        conv.sourcesContent = acc;
        inspect(conv.sourcesContent);
      }
  );   
  
}
