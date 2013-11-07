'use strict';
/*jshint asi: true */

var test = require('tap').test
var root = __dirname + '/fixtures'
var cssFile = root + '/transpiled.css'
var sassResolve = require('../')
var fs = require('fs')

var sources = [ 
  'node_modules/foo/sass/body.scss',
  'node_modules/foo/sass/paragraph.scss',
  'node_modules/foo/node_modules/fooz/sass/main.scss',
  'node_modules/bar/node_modules/baz/sass/headers.scss',
  'node_modules/bar/node_modules/baz/sass/paragraph.scss',
  'sass/main.scss' ];

function transpileNread(opts, cb) {
  try { fs.unlinkSync(cssFile) } catch(e) {}
  try { fs.unlinkSync(cssFile + '.map') } catch(e) {}

  sassResolve(root, cssFile, opts, function (err) {
    if (err) return cb(err);
    fs.readFile(cssFile, 'utf8', cb); 
  })
}

function mapFromFile() {
  return JSON.parse(fs.readFileSync(cssFile + '.map'), 'utf8');
}

function lastLine(css) {
  return css.split('\n').pop();
}

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

// These tests requires sass to be installed, so lets not run it on travis
if (!process.env.TRAVIS) {

  test('\nwhen transpiling with debug flag off', function (t) {
    transpileNread({ debug: false }, function (err, css) {
      if (err) return t.fail(err)  
      t.equal(lastLine(css), '', 'does not generate any sourcemaps')
      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourceContents: off, inlineSourceMap: off', function (t) {
    transpileNread({ debug: true, inlineSourceContents: false, inlineSourceMap: false }, function (err, css) {
      if (err) return t.fail(err)  
      var sm = mapFromFile();

      t.equal(lastLine(css), '/*# sourceMappingURL=transpiled.css.map */', 'generates sourcemap pointing to map file')
      t.deepEqual(sm.sources, sources, 'includes correct sources')
      t.equal(sm.file, 'transpiled.css', 'includes name of file that contains transpiled css')
      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourceContents: on, inlineSourceMap: off', function (t) {
    transpileNread({ debug: true, inlineSourceContents: true, inlineSourceMap: false }, function (err, css) {
      if (err) return t.fail(err)  
      var sm = mapFromFile();

      t.equal(lastLine(css), '/*# sourceMappingURL=transpiled.css.map */', 'generates sourcemap pointing to map file')
      t.deepEqual(sm.sources, sources, 'includes correct sources')
      t.equal(sm.file, 'transpiled.css', 'includes name of file that contains transpiled css')

      inspect(sm);
      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourceContents: on, inlineSourceMap: on', function (t) {
    transpileNread({ debug: true, inlineSourceContents: true, inlineSourceMap: true }, function (err, css) {
      if (err) return t.fail(err)  

      // TODO: this should actually be an inlined source map
      t.equal(lastLine(css), '/*# sourceMappingURL=transpiled.css.map */', 'generates sourcemap pointing to map file')
      t.end()
    })
  })
}
