'use strict';

var resolveSassPaths = require('./lib/resolve-sass-paths');

exports = module.exports = function (root, cb) {

}

/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "sass" field inside packags.json.
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
exports.imports = function (root, cb) {
  resolveSassPaths(root, function (err, scssFiles) {
    if (err) return cb(err);
    var imports = scssFiles.map(function (f) {
      return '@import "' + f + '";';
    }).join('\n');

    cb(null, imports);
  });
}

