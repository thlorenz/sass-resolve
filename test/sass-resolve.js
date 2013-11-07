'use strict';
/*jshint asi: true */

var test = require('tap').test
var root = __dirname + '/fixtures'
var cssFile = root + '/compiled.css'
var sassResolve = require('../')
var fs = require('fs')

function compileNread(opts, cb) {
  sassResolve(root, cssFile, opts, function (err) {
    if (err) return cb(err);
    fs.readFile(cssFile, 'utf8', cb); 
  })
}

function lastLine(css) {
  return css.split('\n').pop();
}

// These tests requires sass to be installed, so lets not run it on travis
if (!process.env.TRAVIS) {

  test('\nwhen compiling with debug flag off', function (t) {
    compileNread({ debug: false }, function (err, css) {
      if (err) return t.fail(err)  
      t.equal(lastLine(css), '', 'does not generate any sourcemaps')
      t.end()
    })
  })

  test('\nwhen compiling with debug: on, inlineSourceContents: off, inlineSourceMap: off', function (t) {
    compileNread({ debug: true, inlineSourceContents: false, inlineSourceMap: false }, function (err, css) {
      if (err) return t.fail(err)  
      t.equal(lastLine(css), '/*# sourceMappingURL=compiled.css.map */', 'generates sourcemap pointing to map file')
      t.end()
    })
  })

  test('\nwhen compiling with debug: on, inlineSourceContents: on, inlineSourceMap: off', function (t) {
    compileNread({ debug: true, inlineSourceContents: true, inlineSourceMap: false }, function (err, css) {
      if (err) return t.fail(err)  
      t.equal(lastLine(css), '/*# sourceMappingURL=compiled.css.map */', 'generates sourcemap pointing to map file')
      t.end()
    })
  })

  test('\nwhen compiling with debug: on, inlineSourceContents: on, inlineSourceMap: on', function (t) {
    compileNread({ debug: true, inlineSourceContents: true, inlineSourceMap: true }, function (err, css) {
      if (err) return t.fail(err)  
      t.equal(lastLine(css), '/*# sourceMappingURL=compiled.css.map */', 'generates sourcemap pointing to map file')
      t.end()
    })
  })
}
