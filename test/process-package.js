'use strict';

var test = require('tap').test
var path = require('path');
var fixtures = path.join(__dirname, 'fixtures');
var processPackage = require('../lib/process-package');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function subdir(info) {
  info.deps = info.deps.map(function(x) { return x.slice(fixtures.length) })

  if (info.resolved) {
    Object.keys(info.resolved).forEach(function (k) {
      info.resolved[k] = info.resolved[k].slice(fixtures.length);
    })
  }
  return info;
}

test('\nprocessing the root fixture path', function (t) {
  processPackage(fixtures, function (err, res) {
    if (err) return t.fail(err);
    var info = subdir(res);
    t.deepEqual(
        info
      , { resolved: { 'foo@0.0.0': '/node_modules/foo/sass/index.scss' },
          id: 'main-project@0.0.0',
          deps: [ '/node_modules/foo', '/node_modules/bar' ],
          depsIds: [ 'foo@0.0.0', 'bar@0.0.0' ] }
      , 'resolves pack correctly'
    )
    t.end()
  })
})

test('\nprocessing foo path', function (t) {
  processPackage(fixtures + '/node_modules/foo', function (err, res) {
    if (err) return t.fail(err);
    var info = subdir(res);
    t.deepEqual(
        info
      , { resolved: { 'fooz@0.0.0': '/node_modules/foo/node_modules/fooz/sass/index.scss' },
          id: 'foo@0.0.0',
          deps: [ '/node_modules/foo/node_modules/fooz' ],
          depsIds: [ 'fooz@0.0.0' ] }
      , 'resolves pack correctly'
    )
    t.end()
  })
})
test('\nprocessing foo/fooz path', function (t) {
  processPackage(fixtures + '/node_modules/foo/node_modules/fooz', function (err, res) {
    if (err) return t.fail(err);
    var info = subdir(res);
    t.deepEqual(
        info
      , { resolved: null,
          id: 'fooz@0.0.0',
          deps: [],
          depsIds: [] }
      , 'resolves pack correctly to return no deps or deps ids'
    )
    t.end()
  })
})

test('\nprocessing bar path', function (t) {
  processPackage(fixtures + '/node_modules/bar', function (err, res) {
    if (err) return t.fail(err);
    var info = subdir(res);
    t.deepEqual(
        info
      , { resolved: { 'baz@0.0.0': '/node_modules/bar/node_modules/baz/sass/index.scss' },
          id: 'bar@0.0.0',
          deps: [ '/node_modules/bar/node_modules/baz' ],
          depsIds: [ 'baz@0.0.0' ] }
      , 'resolves pack correctly to return no deps or deps ids'
    )
    t.end()
  })
})


test('\nprocessing bar/baz path', function (t) {
  processPackage(fixtures + '/node_modules/bar/node_modules/baz', function (err, res) {
    if (err) return t.fail(err);
    var info = subdir(res);
    t.deepEqual(
        info
      , { resolved: null,
          id: 'baz@0.0.0',
          deps: [],
          depsIds: [] }
      , 'resolves pack correctly to return no deps or deps ids'
    )
    t.end()
  })
})
