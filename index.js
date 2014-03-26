'use strict';

var resolveSassPaths =  require('./lib/resolve-sass-paths')
 , scss              =  require('./lib/scss')
 , path              =  require('path')
 , fs                =  require('fs')
 , xtend             =  require('xtend')
 , convertSourceMap  =  require('convert-source-map')
 ;

var defaultOpts = { debug: true, inlineSourcesContent: true, inlineSourceMap: true };

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "main.scss" field inside packags.json.
 * It then generates the css file including all the rules found in the resolved .scss files.
 * Additionally it generates a .css.map file to enable sass source maps if so desired.
 *
 * @name sassResolve
 * @function
 * @param {string}    root                  path to the current package
 * @param {Object=}   opts                  configure if and how source maps are created and if a css file is written
 * @param {boolean=}  opts.debug            (default: true) generate source maps
 *
 * @param {boolean=}  opts.inlineSourceMap  (default: true) inline entire source map info into the .css file
 *                                          instead of referring to an external .scss.map file
 *
 * @param {function=} opts.imports          allows overriding how imports are resolved (see: resolveScssFiles and importsFromScssFiles)
 *
 * @param {string=}   opts.mapFileName      (default: 'transpiled.css.map') name of the source map file to be included 
 *                                          at the bottom of the generated css (not relevant when source maps are inlined)
 *
 * @param cb {Function} function (err, res]) {}, called when all scss files have been transpiled, when nowrite is true,
 *                                          res contains generated `css` and `map` (if sourcemaps were enabled and not inlined) 
 **/
exports = module.exports = function (root, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = xtend(defaultOpts, opts);

  var mapFileName = opts.inlineSourceMap ? null : opts.mapFileName || 'transpiled.css.map';

  (opts.imports || imports)(root, function (err, src) {
    if (err) return cb(err);
    scss(src, opts.debug, root, mapFileName,  function (err, res) {
      if (err) return cb(err);
      cb(null, { css: res.css, map: res.conv && res.conv.toObject() });      
    })
  })
}

/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "main.scss" field inside packags.json.
 * 
 * @name resolveScssFiles
 * @function
 * @param root {String} full path to the project whose scss files to resolve
 * @param cb {Function} called back with a list of paths to .scss files or an error if one occurred
 */
exports.resolveScssFiles = resolveSassPaths;

/**
 * Resolves all paths of all .scss files of this project and its dependencies and 
 * generates the sass imports for them
 * 
 * @name imports
 * @function
 * @param root {String} full path to the project whose sass files to resolve
 * @param cb {Function} called back with imports for the .scss files or an error if one occurred
 */
var imports = exports.imports = function (root, cb) {
  resolveSassPaths(root, function (err, scssFiles) {
    if (err) return cb(err);
    var imports = scssFilesToImports(scssFiles);
    cb(null, imports);
  });
}

/**
 * Creates a .scss import string from the previously resolved sass paths (see: resolveScssFiles)
 * This function is called by `imports` and exposed as an advanced api if more manual tweaking is needed.
 * 
 * @name scssFilesToImports
 * @function
 * @param scssFiles {Array} paths to resolved `.scss` files
 * @return {String} of @import statements for each `.scss` file
 */
var scssFilesToImports = exports.scssFilesToImports = function (scssFiles) {
  return scssFiles.map(function (f) {
    return '@import "' + f + '";';
  }).join('\n');
}
