'use strict';

var path = require('path')
  , asyncReduce = require('asyncreduce')
  , resolve = require('resolve');

function idPackage(pack) {
  return pack.name + '@' + (pack.version || '0.0.0');
}

/**
 * Processes the package.json found in the given directory
 * Finds scss files of all these dependencies and includes their paths, 
 * in order to allow to process each of them as well.
 *
 * So this function will be called again with each dependency found.
 * 
 * @name processPackage
 * @function
 * @private
 * @param {String} dir the dir that contains the package.json to process
 * @param {Function} cb invoked with an error or the following response object:
 * @param {String} ret.resolved String paths to all scss entry files of the dependencies 
 *                              of this package
 * @param {String} ret.id       package id comprised of version and name 
 * @param {Object.<string, string>} ret.deps fullPaths to scssFiles indexed by package id 
 *  - deps: [String] paths to all dependencies of this package
 */
var go = module.exports = function (dir, cb) {
  var pack = require(path.join(dir, 'package.json'));

  if (!pack.dependencies) 
    return cb(null, { resolved: null, id: idPackage(pack), deps: [], depsIds: [] });
  
  var deps = Object.keys(pack.dependencies);

  var depsIds = [];
  var depsPaths = [];
  var currentId;
  var opts = { 
      basedir: dir 
    , extensions: [ '.scss' ]
    , packageFilter: function (pkg, x) { 
        depsIds.push(idPackage(pkg));
        depsPaths.push(x);
        pkg.main = pkg['main.scss'];
        // deps are reduced in series therefore communicating the current id
        // to the resolve callback below like this works, not pretty though
        currentId = idPackage(pkg);
        return pkg;
      }
  };

  asyncReduce(
      deps
    , {} 
    , function (acc, x, cb_) {
        resolve(x, opts, function (err, res) {
          if (err) {
            // we are expecting some modules to not have a sass field
            return (/Cannot find module/).test(err.message) ? cb_(null, acc) : cb_(err);
          }        
          // If main is undefined, resolve tries to be smart and resolve 
          // either index.js or module_name.js.
          // This caused 'punycode' from browser-builtins to be included which is a bug
          // Forcing all main.scss files to have a '.scss' extension fixes this
          if (path.extname(res) === '.scss') acc[currentId] = res;
          cb_(null, acc);
        });  
      }
    , function (err, resolved) {
        if (err) return cb(err);
        cb(null, { resolved: resolved, id: idPackage(pack), deps: depsPaths, depsIds: depsIds });
      }
  );
}
