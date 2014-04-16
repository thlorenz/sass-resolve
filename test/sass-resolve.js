'use strict';
/*jshint asi: true */

var debug// =  true;
var test  =  debug  ? function () {} : require('tap').test
var test_ =  !debug ? function () {} : require('tap').test

var root = __dirname + '/fixtures'
var cssFile = root + '/transpiled.css'
var sassResolve = require('../')
var fs = require('fs')

var sources = [
  // will differ: '../../../../../../../../var/folders/7j/w1lzc1ds7z1fyhw9xsflqgcc0000gn/T/sass-resolve-generated-imports.scss',
  'node_modules/foo/node_modules/fooz/sass/index.scss',
  'node_modules/bar/node_modules/baz/sass/index.scss',
  'node_modules/foo/sass/index.scss',
  'sass/index.scss',
  'node_modules/foo/node_modules/fooz/sass/main.scss',
  'node_modules/bar/node_modules/baz/sass/headers.scss',
  'node_modules/bar/node_modules/baz/sass/paragraph.scss',
  'node_modules/foo/sass/body.scss',
  'node_modules/foo/sass/paragraph.scss',
  'sass/main.scss' ]

var sourcesContent = [ 
  // will differ: '@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/node_modules/foo/sass/index.scss";\n@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/node_modules/foo/node_modules/fooz/sass/index.scss";\n@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/node_modules/bar/node_modules/baz/sass/index.scss";\n@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/sass/index.scss";',
  '@import "main";\n',
  '@import "headers";\n@import "paragraph";\n',
  '@import "body";\n@import "paragraph";\n',
  '@import "main";\n',
  '$color: \'yellow\';\nh5 {\n  color: $color;\n}\n',
  '$h1-font: 24px; \n$h2-font: 16px; \n\n.baz h1 {\n  font-size: $h1-font;\n}\n\n.baz h2 {\n  font-size: $h2-font;\n}\n',
  '$nice-fore-color: #DFD;\n\n.baz p {\n  color: $nice-fore-color;\n}\n',
  '$primary-color: #333;\n\n.foo body {\n  color: $primary-color;\n}\n',
  '$nice-back-color: #333;\n\n.foo p {\n  background: $nice-back-color;\n}\n',
  '.parent-main {\n  display: block;\n}\n' ]

function clean() {
  try { fs.unlinkSync(cssFile) } catch(e) {}
  try { fs.unlinkSync(cssFile + '.map') } catch(e) {}
}

function transpileNread(opts, cb) {
  clean()
  sassResolve(root, opts, function (err, res) {
    if (err) return cb(err);
    cb(err, res)
  })
}

function mapFromFile() {
  return JSON.parse(fs.readFileSync(cssFile + '.map'), 'utf8');
}

function lastLine(css) {
  return css.split('\n').filter(function (x) { return x.trim().length }).pop();
}

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nwhen transpiling with debug flag off', function (t) {
  sassResolve(root, { debug: false }, function (err, res) {
    if (err) return t.fail(err)  

    t.ok(!/^\/\/#/.test(lastLine(res.css)), 'does not generate any sourcemaps')
    t.end()
  })
})

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}
test('\nwhen transpiling with debug: on, inlineSourceMap: off', function (t) {
  sassResolve(root, { debug: true, inlineSourceMap: false }, function (err, res) {
    if (err) return t.fail(err)  
    var sm = res.map;

    t.equal(lastLine(res.css), '/*# sourceMappingURL=transpiled.css.map */', 'generates sourcemap pointing to map file')
    t.deepEqual(sm.sources.slice(1), sources, 'includes correct sources')
    t.equal(sm.file, 'transpiled.css', 'includes name of file that contains transpiled css')
    t.deepEqual(sm.sourcesContent.slice(1), sourcesContent, 'includes sourcesContent')

    t.end()
  })
})

test('\nwhen transpiling with debug: on, inlineSourceMap: on', function (t) {
  sassResolve(root, { debug: true, inlineSourceMap: true }, function (err, res) {
    if (err) return t.fail(err)  

    var smline = lastLine(res.css);
    var expectedInlineSourceMap = '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid' // more but inconsistent

    t.equal(
        smline.slice(0, expectedInlineSourceMap.length)
      , expectedInlineSourceMap  
      , 'inlines sourcemap including sources content'
    )
    t.ok(!res.map, 'returns no external map');
    t.end()
  })
})
