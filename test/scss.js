'use strict';
/*jshint asi: true */

var test = require('tap').test
  , scss = require('../lib/scss')

var src = [
    '@import "' + __dirname + '/fixtures/node_modules/foo/sass/index.scss";'
  , '@import "' + __dirname + '/fixtures/node_modules/foo/node_modules/fooz/sass/index.scss";'
  , '@import "' + __dirname + '/fixtures/node_modules/bar/node_modules/baz/sass/index.scss";'
  , '@import "' + __dirname + '/fixtures/sass/index.scss";'
].join('\n');

var expectedSources = [ 
  // this will differ: '../../../../../../var/folders/7j/w1lzc1ds7z1fyhw9xsflqgcc0000gn/T/sass-resolve-generated-imports.scss', 
  'test/fixtures/node_modules/foo/sass/index.scss',
  'test/fixtures/node_modules/foo/node_modules/fooz/sass/index.scss',
  'test/fixtures/node_modules/bar/node_modules/baz/sass/index.scss',
  'test/fixtures/sass/index.scss',
  'test/fixtures/node_modules/foo/sass/body.scss',
  'test/fixtures/node_modules/foo/sass/paragraph.scss',
  'test/fixtures/node_modules/foo/node_modules/fooz/sass/main.scss',
  'test/fixtures/node_modules/bar/node_modules/baz/sass/headers.scss',
  'test/fixtures/node_modules/bar/node_modules/baz/sass/paragraph.scss',
  'test/fixtures/sass/main.scss' ]

var expectedContent = [ 
  // this will differ: '@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/node_modules/foo/sass/index.scss";\n@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/node_modules/foo/node_modules/fooz/sass/index.scss";\n@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/node_modules/bar/node_modules/baz/sass/index.scss";\n@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/sass/index.scss";',
  '@import "body";\n@import "paragraph";\n',
  '@import "main";\n',
  '@import "headers";\n@import "paragraph";\n',
  '@import "main";\n',
  '$primary-color: #333;\n\n.foo body {\n  color: $primary-color;\n}\n',
  '$nice-back-color: #333;\n\n.foo p {\n  background: $nice-back-color;\n}\n',
  '$color: \'yellow\';\nh5 {\n  color: $color;\n}\n',
  '$h1-font: 24px; \n$h2-font: 16px; \n\n.baz h1 {\n  font-size: $h1-font;\n}\n\n.baz h2 {\n  font-size: $h2-font;\n}\n',
  '$nice-fore-color: #DFD;\n\n.baz p {\n  color: $nice-fore-color;\n}\n',
  '.parent-main {\n  display: block;\n}\n' ] 

var expectedMappings = 'AKEA,KAAK;EACH,OAHc;;ACEhB,KAAK;EACH,YAHgB;;ACClB;EACE,OAFM;;ACGR,KAAK;EACH,WAJQ;;AAOV,KAAK;EACH,WAPQ;;ACCV,KAAK;EACH,OAHgB;;ACAlB;EACE,SAAS'

var expectedCss = [ 
  '.foo body {',
  '  color: #333; }',
  '',
  '.foo p {',
  '  background: #333; }',
  '',
  'h5 {',
  '  color: \'yellow\'; }',
  '',
  '.baz h1 {',
  '  font-size: 24px; }',
  '',
  '.baz h2 {',
  '  font-size: 16px; }',
  '',
  '.baz p {',
  '  color: #DFD; }',
  '',
  '.parent-main {',
  '  display: block; }',
  '',
  '/*# sourceMappingURL=some.css.map */' ]

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nsource maps turned on', function (t) {
  scss(src, true, 'some.css.map', function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    var map = res.conv.toObject();

    t.deepEqual(res.css.split('\n'), expectedCss, 'renders css with source mapping url')

    t.deepEqual(map.sources.slice(1), expectedSources, 'includes correct sources in source map')
    t.deepEqual(map.sourcesContent.slice(1), expectedContent, 'includes correct sources content in source map')
    t.equal(map.mappings, expectedMappings, 'includes correct mappings')

    t.end()
  })
})

test('\nsource maps turned off', function (t) {
  scss(src, false, 'some.css.map', function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.css.split('\n'), expectedCss.slice(0, -1), 'renders css without sourcemapping url')

    t.ok(!res.conv, 'includes no sourcemap')
    t.end()
  });
})
