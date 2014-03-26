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
  '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi92YXIvZm9sZGVycy83ai93MWx6YzFkczd6MWZ5aHc5eHNmbHFnY2MwMDAwZ24vVC9zYXNzLXJlc29sdmUtZ2VuZXJhdGVkLWltcG9ydHMuc2NzcyIsInRlc3QvZml4dHVyZXMvbm9kZV9tb2R1bGVzL2Zvby9zYXNzL2luZGV4LnNjc3MiLCJ0ZXN0L2ZpeHR1cmVzL25vZGVfbW9kdWxlcy9mb28vbm9kZV9tb2R1bGVzL2Zvb3ovc2Fzcy9pbmRleC5zY3NzIiwidGVzdC9maXh0dXJlcy9ub2RlX21vZHVsZXMvYmFyL25vZGVfbW9kdWxlcy9iYXovc2Fzcy9pbmRleC5zY3NzIiwidGVzdC9maXh0dXJlcy9zYXNzL2luZGV4LnNjc3MiLCJ0ZXN0L2ZpeHR1cmVzL25vZGVfbW9kdWxlcy9mb28vc2Fzcy9ib2R5LnNjc3MiLCJ0ZXN0L2ZpeHR1cmVzL25vZGVfbW9kdWxlcy9mb28vc2Fzcy9wYXJhZ3JhcGguc2NzcyIsInRlc3QvZml4dHVyZXMvbm9kZV9tb2R1bGVzL2Zvby9ub2RlX21vZHVsZXMvZm9vei9zYXNzL21haW4uc2NzcyIsInRlc3QvZml4dHVyZXMvbm9kZV9tb2R1bGVzL2Jhci9ub2RlX21vZHVsZXMvYmF6L3Nhc3MvaGVhZGVycy5zY3NzIiwidGVzdC9maXh0dXJlcy9ub2RlX21vZHVsZXMvYmFyL25vZGVfbW9kdWxlcy9iYXovc2Fzcy9wYXJhZ3JhcGguc2NzcyIsInRlc3QvZml4dHVyZXMvc2Fzcy9tYWluLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFLRUEsS0FBSztFQUNILE9BSGM7O0FDRWhCLEtBQUs7RUFDSCxZQUhnQjs7QUNDbEI7RUFDRSxPQUZNOztBQ0dSLEtBQUs7RUFDSCxXQUpROztBQU9WLEtBQUs7RUFDSCxXQVBROztBQ0NWLEtBQUs7RUFDSCxPQUhnQjs7QUNBbEI7RUFDRSxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiQGltcG9ydCBcIi9Vc2Vycy90aGxvcmVuei9kZXYvanMvcHJvamVjdHMvc2Fzcy1yZXNvbHZlL3Rlc3QvZml4dHVyZXMvbm9kZV9tb2R1bGVzL2Zvby9zYXNzL2luZGV4LnNjc3NcIjtcbkBpbXBvcnQgXCIvVXNlcnMvdGhsb3JlbnovZGV2L2pzL3Byb2plY3RzL3Nhc3MtcmVzb2x2ZS90ZXN0L2ZpeHR1cmVzL25vZGVfbW9kdWxlcy9mb28vbm9kZV9tb2R1bGVzL2Zvb3ovc2Fzcy9pbmRleC5zY3NzXCI7XG5AaW1wb3J0IFwiL1VzZXJzL3RobG9yZW56L2Rldi9qcy9wcm9qZWN0cy9zYXNzLXJlc29sdmUvdGVzdC9maXh0dXJlcy9ub2RlX21vZHVsZXMvYmFyL25vZGVfbW9kdWxlcy9iYXovc2Fzcy9pbmRleC5zY3NzXCI7XG5AaW1wb3J0IFwiL1VzZXJzL3RobG9yZW56L2Rldi9qcy9wcm9qZWN0cy9zYXNzLXJlc29sdmUvdGVzdC9maXh0dXJlcy9zYXNzL2luZGV4LnNjc3NcIjsiLCJAaW1wb3J0IFwiYm9keVwiO1xuQGltcG9ydCBcInBhcmFncmFwaFwiO1xuIiwiQGltcG9ydCBcIm1haW5cIjtcbiIsIkBpbXBvcnQgXCJoZWFkZXJzXCI7XG5AaW1wb3J0IFwicGFyYWdyYXBoXCI7XG4iLCJAaW1wb3J0IFwibWFpblwiO1xuIiwiJHByaW1hcnktY29sb3I6ICMzMzM7XG5cbi5mb28gYm9keSB7XG4gIGNvbG9yOiAkcHJpbWFyeS1jb2xvcjtcbn1cbiIsIiRuaWNlLWJhY2stY29sb3I6ICMzMzM7XG5cbi5mb28gcCB7XG4gIGJhY2tncm91bmQ6ICRuaWNlLWJhY2stY29sb3I7XG59XG4iLCIkY29sb3I6ICd5ZWxsb3cnO1xuaDUge1xuICBjb2xvcjogJGNvbG9yO1xufVxuIiwiJGgxLWZvbnQ6IDI0cHg7IFxuJGgyLWZvbnQ6IDE2cHg7IFxuXG4uYmF6IGgxIHtcbiAgZm9udC1zaXplOiAkaDEtZm9udDtcbn1cblxuLmJheiBoMiB7XG4gIGZvbnQtc2l6ZTogJGgyLWZvbnQ7XG59XG4iLCIkbmljZS1mb3JlLWNvbG9yOiAjREZEO1xuXG4uYmF6IHAge1xuICBjb2xvcjogJG5pY2UtZm9yZS1jb2xvcjtcbn1cbiIsIi5wYXJlbnQtbWFpbiB7XG4gIGRpc3BsYXk6IGJsb2NrO1xufVxuIl19'
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
