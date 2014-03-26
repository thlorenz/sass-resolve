'use strict';
/*jshint asi: true */

var test    = require('tap').test
  , scss    = require('../lib/scss')

var root = __dirname + '/..';

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

var expectedInlineSourceMap = [ 
  '',
  '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNwaWxlZC5jc3MiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Zhci9mb2xkZXJzLzdqL3cxbHpjMWRzN3oxZnlodzl4c2ZscWdjYzAwMDBnbi9UL3Nhc3MtcmVzb2x2ZS1nZW5lcmF0ZWQtaW1wb3J0cy5zY3NzIiwidGVzdC9maXh0dXJlcy9ub2RlX21vZHVsZXMvZm9vL3Nhc3MvaW5kZXguc2NzcyIsInRlc3QvZml4dHVyZXMvbm9kZV9tb2R1bGVzL2Zvby9ub2RlX21vZHVsZXMvZm9vei9zYXNzL2luZGV4LnNjc3MiLCJ0ZXN0L2ZpeHR1cmVzL25vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL2luZGV4LnNjc3MiLCJ0ZXN0L2ZpeHR1cmVzL3Nhc3MvaW5kZXguc2NzcyIsInRlc3QvZml4dHVyZXMvbm9kZV9tb2R1bGVzL2Zvby9zYXNzL2JvZHkuc2NzcyIsInRlc3QvZml4dHVyZXMvbm9kZV9tb2R1bGVzL2Zvby9zYXNzL3BhcmFncmFwaC5zY3NzIiwidGVzdC9maXh0dXJlcy9ub2RlX21vZHVsZXMvZm9vL25vZGVfbW9kdWxlcy9mb296L3Nhc3MvbWFpbi5zY3NzIiwidGVzdC9maXh0dXJlcy9ub2RlX21vZHVsZXMvYmFyL25vZGVfbW9kdWxlcy9iYXovc2Fzcy9oZWFkZXJzLnNjc3MiLCJ0ZXN0L2ZpeHR1cmVzL25vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL3BhcmFncmFwaC5zY3NzIiwidGVzdC9maXh0dXJlcy9zYXNzL21haW4uc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUtFQSxLQUFLO0VBQ0gsT0FIYzs7QUNFaEIsS0FBSztFQUNILFlBSGdCOztBQ0NsQjtFQUNFLE9BRk07O0FDR1IsS0FBSztFQUNILFdBSlE7O0FBT1YsS0FBSztFQUNILFdBUFE7O0FDQ1YsS0FBSztFQUNILE9BSGdCOztBQ0FsQjtFQUNFLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJAaW1wb3J0IFwiL1VzZXJzL3RobG9yZW56L2Rldi9qcy9wcm9qZWN0cy9zYXNzLXJlc29sdmUvdGVzdC9maXh0dXJlcy9ub2RlX21vZHVsZXMvZm9vL3Nhc3MvaW5kZXguc2Nzc1wiO1xuQGltcG9ydCBcIi9Vc2Vycy90aGxvcmVuei9kZXYvanMvcHJvamVjdHMvc2Fzcy1yZXNvbHZlL3Rlc3QvZml4dHVyZXMvbm9kZV9tb2R1bGVzL2Zvby9ub2RlX21vZHVsZXMvZm9vei9zYXNzL2luZGV4LnNjc3NcIjtcbkBpbXBvcnQgXCIvVXNlcnMvdGhsb3JlbnovZGV2L2pzL3Byb2plY3RzL3Nhc3MtcmVzb2x2ZS90ZXN0L2ZpeHR1cmVzL25vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL2luZGV4LnNjc3NcIjtcbkBpbXBvcnQgXCIvVXNlcnMvdGhsb3JlbnovZGV2L2pzL3Byb2plY3RzL3Nhc3MtcmVzb2x2ZS90ZXN0L2ZpeHR1cmVzL3Nhc3MvaW5kZXguc2Nzc1wiOyIsIkBpbXBvcnQgXCJib2R5XCI7XG5AaW1wb3J0IFwicGFyYWdyYXBoXCI7XG4iLCJAaW1wb3J0IFwibWFpblwiO1xuIiwiQGltcG9ydCBcImhlYWRlcnNcIjtcbkBpbXBvcnQgXCJwYXJhZ3JhcGhcIjtcbiIsIkBpbXBvcnQgXCJtYWluXCI7XG4iLCIkcHJpbWFyeS1jb2xvcjogIzMzMztcblxuLmZvbyBib2R5IHtcbiAgY29sb3I6ICRwcmltYXJ5LWNvbG9yO1xufVxuIiwiJG5pY2UtYmFjay1jb2xvcjogIzMzMztcblxuLmZvbyBwIHtcbiAgYmFja2dyb3VuZDogJG5pY2UtYmFjay1jb2xvcjtcbn1cbiIsIiRjb2xvcjogJ3llbGxvdyc7XG5oNSB7XG4gIGNvbG9yOiAkY29sb3I7XG59XG4iLCIkaDEtZm9udDogMjRweDsgXG4kaDItZm9udDogMTZweDsgXG5cbi5iYXogaDEge1xuICBmb250LXNpemU6ICRoMS1mb250O1xufVxuXG4uYmF6IGgyIHtcbiAgZm9udC1zaXplOiAkaDItZm9udDtcbn1cbiIsIiRuaWNlLWZvcmUtY29sb3I6ICNERkQ7XG5cbi5iYXogcCB7XG4gIGNvbG9yOiAkbmljZS1mb3JlLWNvbG9yO1xufVxuIiwiLnBhcmVudC1tYWluIHtcbiAgZGlzcGxheTogYmxvY2s7XG59XG4iXX0='
]

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

test('\nsource maps turned on', function (t) {
  scss(src, true, root, 'some.css.map', function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    var map = res.conv.toObject();

    t.deepEqual(res.css.split('\n'), expectedCss, 'renders css with source mapping url')

    t.deepEqual(map.sources.slice(1), expectedSources, 'includes correct sources in source map')
    t.deepEqual(map.sourcesContent.slice(1), expectedContent, 'includes correct sources content in source map')
    t.equal(map.mappings, expectedMappings, 'includes correct mappings')

    t.end()
  })
})

test('\nsource maps turned on but no mapfile supplied', function (t) {
  scss(src, true, root, null, function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.ok(!res.conv, 'includes no external sourcemap')

    t.deepEqual(res.css.split('\n'), expectedCss.slice(0, -1).concat(expectedInlineSourceMap), 'renders css with inlined sourcemap')

    t.end()
  })
})

test('\nsource maps turned off', function (t) {
  scss(src, false, root, 'some.css.map', function (err, res) {
    if (err) { t.fail(err); return t.end(); }
    t.deepEqual(res.css.split('\n'), expectedCss.slice(0, -1), 'renders css without sourcemapping url')

    t.ok(!res.conv, 'includes no sourcemap')
    t.end()
  });
})
