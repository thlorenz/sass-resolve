'use strict';

var processPackage = require('./process-package');
var path = require('path');
var sort = require('./sort-sass-paths');

var si = typeof setImmediate === 'function' ? setImmediate : function (fn) { process.nextTick(fn) };

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function idPackage(pack) {
  return pack.name + '@' + (pack.version || '0.0.0');
}

function walkNprocess(start, root, cb) {
  var files = {} 
    , pending = 0
    , deptree = {}
    ;

  function wnpRec(dir) {

    processPackage(dir, function (err, res) {

      if (res.resolved) {
        Object.keys(res.resolved).forEach(function (k) { files[k] = res.resolved[k] });
      }

      deptree[res.id] = res.depsIds;

      res.deps.forEach(function (dep) {
        pending++;

        // the first file of the scssFiles of the current package (usually it's one) is considered
        // to be the parent of all of its dependencies
        si(wnpRec.bind(null, dep));
      });
      if (!--pending) return cb(null, { files: files, deptree: deptree });
    });

  }

  pending++;

  if (root) files[root.id] = root.resolved;
  wnpRec(start);
}

/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "main.scss" field inside packags.json.
 *
 * They are ordered such that the dependencies come before the files that depend on them.
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
  var rootInfo = rootScss ? { id: idPackage(pkg), resolved: rootScss } : undefined;
  walkNprocess(root, rootInfo, function (err, info) {
    if (err) return cb(err);
    cb(null, sort(info));
  });
};

// Test
if (!module.parent && typeof window === 'undefined') {
  var fixtures = path.join(__dirname, '..', 'test', 'fixtures');
  go(fixtures,  function (err, res) {
    if (err) return console.error(err);
    inspect(res);
  })
}
