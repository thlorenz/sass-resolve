'use strict';

var processPackage = require('./process-package');
var path = require('path');
var sort = require('./sort-sass-paths');

var si = typeof setImmediate === 'function' ? setImmediate : function (fn) { process.nextTick(fn) };

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function walkNprocess(start, parent, cb) {
  var scssFiles = []
    , pending = 0;

  function wnpRec(dir, parent) {
    processPackage(dir, function (err, res) {

      var parented = res.scssFiles.map(function (x) { 
        return { path: x, parent: parent }
      })

      scssFiles = scssFiles.concat(parented);
      res.deps.forEach(function (dep) {
        pending++;

        // the first file of the scssFiles of the current package (usually it's one) is considered
        // to be the parent of all of its dependencies
        si(wnpRec.bind(null, dep, res.scssFiles[0]));
      });
      if (!--pending) return cb(null, scssFiles);
    });

  }

  pending++;
  wnpRec(start, parent);
}

/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "main.scss" field inside packags.json.
 * 
 * @name resolveSassPaths
 * @function
 * @private
 * @param root {String} full path to the project whose sass files to resolve
 * @param cb {Function} called back with a list of paths to .scss files or an error if one occurred
 */
var go = module.exports = function (root, cb) {
  var pkgPath = path.join(root, 'package.json');
  var pkg = require(pkgPath);

  var rootScss = pkg['main.scss'] && path.resolve(root, pkg['main.scss']);
  walkNprocess(root, rootScss, function (err, scssFiles) {
    if (err) return cb(err);
    if (rootScss) scssFiles.push({ path: rootScss });
    cb(null, sort(scssFiles));
  });
};
