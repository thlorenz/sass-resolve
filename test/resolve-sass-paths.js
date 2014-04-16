'use strict';
/*jshint asi: true */

var test = require('tap').test
var path = require('path')
var resolveSassPaths = require('../lib/resolve-sass-paths')
var fixtures = path.join(__dirname, 'fixtures');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function subdir(dir) {
  return dir.slice(fixtures.length);
}

test('\nresolving sass paths starting in the fixtures main directory', function (t) {
  resolveSassPaths(fixtures,  function (err, res) {
    if (err) return console.error(err);

    var dirs = res.map(subdir);

    t.equal(dirs.length, 4, 'resolves 4 scss files');
    t.deepEqual(
        dirs
      , [ '/node_modules/foo/node_modules/fooz/sass/index.scss',
          '/node_modules/bar/node_modules/baz/sass/index.scss',
          '/node_modules/foo/sass/index.scss',
          '/sass/index.scss' ]
      , 'resolves all paths and orders them correctly so that children come before their parents'
    )
    t.end()
  })
})

