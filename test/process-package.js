'use strict';

var test = require('tap').test
var path = require('path');
var fixtures = path.join(__dirname, 'fixtures');
var processPackage = require('../lib/process-package');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function subdir(dir) {
  return dir.slice(fixtures.length);
}

test('\nprocessing the root fixture path', function (t) {
  processPackage(fixtures, function (err, res) {
    if (err) return t.fail(err);
    var scssFiles = res.scssFiles.map(subdir);
    var deps = res.deps.map(subdir);
    t.deepEqual(scssFiles, [ '/node_modules/foo/sass/index.scss' ], 'resolves foo scss index')
    t.deepEqual(deps, [ '/node_modules/foo', '/node_modules/bar' ], 'resolves foo and bar directories')
    t.end()
  })
})

test('\nprocessing foo path', function (t) {
  processPackage(fixtures + '/node_modules/foo', function (err, res) {
    if (err) return t.fail(err);
    var scssFiles = res.scssFiles.map(subdir);
    var deps = res.deps.map(subdir);
    t.deepEqual(scssFiles, [ '/node_modules/foo/node_modules/fooz/sass/index.scss' ], 'resolves fooz scss index')
    t.deepEqual(deps, [ '/node_modules/foo/node_modules/fooz' ], 'resolves fooz directory')
    t.end()
  })
})

test('\nprocessing foo/fooz path', function (t) {
  processPackage(fixtures + '/node_modules/foo/node_modules/fooz', function (err, res) {
    if (err) return t.fail(err);
    var scssFiles = res.scssFiles.map(subdir);
    var deps = res.deps.map(subdir);
    t.deepEqual(scssFiles, [ ], 'resolves no scssFiles')
    t.deepEqual(deps, [ ], 'resolves no deps')
    t.end()
  })
})

test('\nprocessing bar path', function (t) {
  processPackage(fixtures + '/node_modules/bar', function (err, res) {
    if (err) return t.fail(err);
    var scssFiles = res.scssFiles.map(subdir);
    var deps = res.deps.map(subdir);

    t.deepEqual(scssFiles, [ '/node_modules/bar/node_modules/baz/sass/index.scss' ], 'resolves baz scss index')
    t.deepEqual(deps, [ '/node_modules/bar/node_modules/baz' ], 'resolves baz directory')
    t.end()
  })
})

test('\nprocessing bar/baz path', function (t) {
  processPackage(fixtures + '/node_modules/bar/node_modules/baz', function (err, res) {
    if (err) return t.fail(err);
    var scssFiles = res.scssFiles.map(subdir);
    var deps = res.deps.map(subdir);
    t.deepEqual(scssFiles, [ ], 'resolves no scssFiles')
    t.deepEqual(deps, [ ], 'resolves no deps')
    t.end()
  })
})
