'use strict';

var sass            = require('node-sass')
  , fs              = require('fs')
  , path            = require('path')
  , os              = require('os')
  , convertSourceMap = require('convert-source-map')
  , resolveScssSources = require('./resolve-scss-sources')
  , assert          = require('assert')
  ; 

var tmpdir         = os.tmpDir()
  , genImportsPath = path.join(tmpdir, 'sass-resolve-generated-imports.scss');

function relativizePaths(root, conv) {
  var sources = conv
    .getProperty('sources')
    .map(function (x) {
      return path.relative(root, x);
    });

  conv.setProperty('sources', sources);
}

/**
 * Runs scss program with for givven scss and css file, optionally with sourcemaps calls back when finished
 * The source map contents are inlined in to make the source map self contained
 *
 * @name scss
 * @function
 * @private
 * @param scssPath {string} path to scss file to compile
 * @param debug {boolean} if true source maps will be included
 * @param mapFileName {string} name of map file, `undefined` if sourcemaps are inlined 
 * @param cb {function} calls back with an error or response containing css and convertSourceMap object
 */
var go = module.exports = function (src, debug, mapFileName, cb) {

  if (typeof mapFileName === 'function') {
    assert(!debug, 'need to supply map filename in order to generate proper source maps');
    cb = mapFileName;
    mapFileName = null;
  }

  function onrendered(css, jsonMap) {
    if (!jsonMap) return cb(null, { css: css, conv: null });

    var conv = convertSourceMap.fromJSON(jsonMap);

    // libsass adds sources relative to cwd (inside C++ no way to override even by patching process.cwd)
    var root = process.cwd();

    resolveScssSources(root, conv, function (err) {
      if (err) return cb(err);
      relativizePaths(root, conv);
      cb(null, { css: css, conv: conv });
    })
  }

  // We could just render the src of our imports directly via the { data: src } property
  // Unfortunately then libsass doesn't generate any source maps, so we have to take the hit of writing it to a file first :(

  // the imports contain absolute paths, so it shouldn't matter where the import file ends up
  fs.writeFile(genImportsPath, src, 'utf8', function (err) {
    if (err) return cb(err);

    sass.render({
        file           : genImportsPath
      , sourceComments : debug ? 'map' : 'none'
      , sourceMap      : mapFileName
      , success        : onrendered
      , error          : cb
    })
  })
}
