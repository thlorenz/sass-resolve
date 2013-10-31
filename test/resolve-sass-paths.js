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
  resolveSassPaths(path.join(__dirname, 'fixtures'),  function (err, res) {
    if (err) return console.error(err);

    t.deepEqual(
        res.map(subdir)
      , [ '/node_modules/foo/sass/index.scss',
          '/node_modules/foo/node_modules/fooz/sass/index.scss',
          '/node_modules/bar/node_modules/baz/sass/index.scss',
          '/sass/index.scss' ]
      , 'resolves all sass files of main package and its dependencies'
    )
    t.end()
  })
})

