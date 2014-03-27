'use strict';

var processPackage = require('./process-package');
var path = require('path');

var setImmediate = setImmediate || function (fn) { process.nextTick(fn) };

function walkNprocess(start, cb) {
  var scssFiles = []
    , pending = 0;

  function wnpRec(dir) {
    processPackage(dir, function (err, res) {
      scssFiles = scssFiles.concat(res.scssFiles);
      res.deps.forEach(function (dep) {
        pending++;
        setImmediate(wnpRec.bind(null, dep));
      });
      if (!--pending) return cb(null, scssFiles);
    });

  }

  pending++;
  wnpRec(start);
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

  walkNprocess(root, function (err, scssFiles) {
    if (err) return cb(err);
    if (pkg['main.scss']) scssFiles.push(path.resolve(root, pkg['main.scss']));
    cb(null, scssFiles);
  });
};
