'use strict';

var spawn = require('child_process').spawn;

function run(progName, cmds, cb) {
  var prog = spawn(
      progName
    , cmds
    , { stdio: 'inherit', env: { SASSPATH: '.' } })

  prog
    .on('close', function (code) {
      if (code !== 0) return cb(new Error('prog ' + cmds.join(' ') + ' returned with code ' + code));
      cb();
    })
}

/**
 * Runs scss program with for givven scss and css file, optionally with sourcemaps calls back when finished
 * @name exports
 * @function
 * @param scssPath {String} path to scss file to compile
 * @param cssPath {String} path to css into which compiled css is saved
 * @param debug {String} if true source maps will be included
 * @param cb {Function} called when scss is finished
 */
var go = module.exports = function (scssPath, cssPath, debug, cb) {
  var args = [ scssPath, cssPath ];
  if (debug) args.unshift('--sourcemap') 
  
  run('scss', args, cb);
};
