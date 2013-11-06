'use strict';

var resolveSassPaths =  require('./lib/resolve-sass-paths')
 , scss              =  require('./lib/scss')
 , os                =  require('os')
 , path              =  require('path')
 , fs                =  require('fs')
 , xtend             =  require('xtend')
 ;

var tmpdir = os.tmpDir();
var genImportsPath = path.join(tmpdir, 'sass-resolve-generated-imports.scss');

var defaultOpts = { debug: true, inlineSourceContents: true, inlineSourceMap: true };

/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "main.scss" field inside packags.json.
 * It then generates the css file including all the rules found in the resolved .scss files.
 * Additionally it generates a .css.map file to enable sass source maps. 
 *
 * NOTE: at this point sass 3.3 is still not officially released, but required to get sourcemaps.
 * 
 * @name sassResolve
 * @function
 * @param root {String} path to the current package
 * @param cssFile {String} path at which the resulting css file should be saved, the .css.map file is saved right next to it
 * @param opts {Object} (optional) configure if and how source maps are created:
 *  - debug (true) generate source maps
 *  - inlineSourceContents (true) inline mapped (.scss) content instead of referring to original the files separately 
 *  - inlineSourceMap (true) inline entire source map info into the .css file  instead of referring to an external .scss.map file
 * @param cb {Function} called back with an error or null when the css file was successfully generated.
 */
exports = module.exports = function (root, cssFile, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = xtend(defaultOpts, opts);

  imports(root, function (err, src) {
    if (err) return cb(err);
    // the imports contain absolute paths, so it doesn't matter where the import file ends up
    fs.writeFile(genImportsPath, src, 'utf8', function (err) {
      if (err) return cb(err);
      scss(genImportsPath, cssFile, cb);
    });
  });  
}

/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "main.scss" field inside packags.json.
 * 
 * @name resolveSassPaths
 * @function
 * @param root {String} full path to the project whose sass files to resolve
 * @param cb {Function} called back with a list of paths to .scss files or an error if one occurred
 */
exports.paths = resolveSassPaths;

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
    var imports = scssFiles.map(function (f) {
      return '@import "' + f + '";';
    }).join('\n');

    cb(null, imports);
  });
}
