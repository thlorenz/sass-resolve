'use strict';

var run = require('./run');

var go = module.exports = function (scssPath, cssPath, cb) {
  run('scss', [ '--sourcemap', scssPath, cssPath ], cb);
};
