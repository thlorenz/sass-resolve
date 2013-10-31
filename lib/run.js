'use strict';

var spawn = require('child_process').spawn;

/**
 * Runs given program with given cmds and calls back when finished
 * @name exports
 * @function
 * @param progName {String} name or path to program to run
 * @param cmds {Array[String]} arguments passed to the program
 * @param cb {Function} called when program is finished
 */
module.exports = function run(progName, cmds, cb) {
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
