'use strict';
/*jshint asi: true */

var debug //=  true;
var test  =  debug  ? function () {} : require('tap').test
var test_ =  !debug ? function () {} : require('tap').test

var root = __dirname + '/fixtures'
var cssFile = root + '/transpiled.css'
var sassResolve = require('../')
var fs = require('fs')

var sources = [
  // will differ: '../../../../../../../../var/folders/7j/w1lzc1ds7z1fyhw9xsflqgcc0000gn/T/sass-resolve-generated-imports.scss',
  'node_modules/foo/sass/index.scss',
  'node_modules/foo/node_modules/fooz/sass/index.scss',
  'node_modules/bar/node_modules/baz/sass/index.scss',
  'sass/index.scss',
  'node_modules/foo/sass/body.scss',
  'node_modules/foo/sass/paragraph.scss',
  'node_modules/foo/node_modules/fooz/sass/main.scss',
  'node_modules/bar/node_modules/baz/sass/headers.scss',
  'node_modules/bar/node_modules/baz/sass/paragraph.scss',
  'sass/main.scss' ]

var sourcesContent = [ 
  // will differ: '@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/node_modules/foo/sass/index.scss";\n@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/node_modules/foo/node_modules/fooz/sass/index.scss";\n@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/node_modules/bar/node_modules/baz/sass/index.scss";\n@import "/Users/thlorenz/dev/js/projects/sass-resolve/test/fixtures/sass/index.scss";',
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

    t.equal(
      lastLine(res.css)
      , '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNwaWxlZC5jc3MiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Zhci9mb2xkZXJzL3k3L3NibjBxaDRqMF85MHY4NzlxNWNjbnZmaDAwMDBncC9UL3Nhc3MtcmVzb2x2ZS1nZW5lcmF0ZWQtaW1wb3J0cy5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9zYXNzL2luZGV4LnNjc3MiLCJub2RlX21vZHVsZXMvZm9vL25vZGVfbW9kdWxlcy9mb296L3Nhc3MvaW5kZXguc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL2luZGV4LnNjc3MiLCJzYXNzL2luZGV4LnNjc3MiLCJub2RlX21vZHVsZXMvZm9vL3Nhc3MvYm9keS5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9zYXNzL3BhcmFncmFwaC5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9ub2RlX21vZHVsZXMvZm9vei9zYXNzL21haW4uc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL2hlYWRlcnMuc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL3BhcmFncmFwaC5zY3NzIiwic2Fzcy9tYWluLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFLRUEsS0FBSztFQUNILE9BSGM7O0FDRWhCLEtBQUs7RUFDSCxZQUhnQjs7QUNDbEI7RUFDRSxPQUZNOztBQ0dSLEtBQUs7RUFDSCxXQUpROztBQU9WLEtBQUs7RUFDSCxXQVBROztBQ0NWLEtBQUs7RUFDSCxPQUhnQjs7QUNBbEI7RUFDRSxTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiQGltcG9ydCBcIi9Vc2Vycy90aGxvcmVuei9kZXYvcHJvamVjdHMvc2Fzcy1yZXNvbHZlL3Rlc3QvZml4dHVyZXMvbm9kZV9tb2R1bGVzL2Zvby9zYXNzL2luZGV4LnNjc3NcIjtcbkBpbXBvcnQgXCIvVXNlcnMvdGhsb3JlbnovZGV2L3Byb2plY3RzL3Nhc3MtcmVzb2x2ZS90ZXN0L2ZpeHR1cmVzL25vZGVfbW9kdWxlcy9mb28vbm9kZV9tb2R1bGVzL2Zvb3ovc2Fzcy9pbmRleC5zY3NzXCI7XG5AaW1wb3J0IFwiL1VzZXJzL3RobG9yZW56L2Rldi9wcm9qZWN0cy9zYXNzLXJlc29sdmUvdGVzdC9maXh0dXJlcy9ub2RlX21vZHVsZXMvYmFyL25vZGVfbW9kdWxlcy9iYXovc2Fzcy9pbmRleC5zY3NzXCI7XG5AaW1wb3J0IFwiL1VzZXJzL3RobG9yZW56L2Rldi9wcm9qZWN0cy9zYXNzLXJlc29sdmUvdGVzdC9maXh0dXJlcy9zYXNzL2luZGV4LnNjc3NcIjsiLCJAaW1wb3J0IFwiYm9keVwiO1xuQGltcG9ydCBcInBhcmFncmFwaFwiO1xuIiwiQGltcG9ydCBcIm1haW5cIjtcbiIsIkBpbXBvcnQgXCJoZWFkZXJzXCI7XG5AaW1wb3J0IFwicGFyYWdyYXBoXCI7XG4iLCJAaW1wb3J0IFwibWFpblwiO1xuIiwiJHByaW1hcnktY29sb3I6ICMzMzM7XG5cbi5mb28gYm9keSB7XG4gIGNvbG9yOiAkcHJpbWFyeS1jb2xvcjtcbn1cbiIsIiRuaWNlLWJhY2stY29sb3I6ICMzMzM7XG5cbi5mb28gcCB7XG4gIGJhY2tncm91bmQ6ICRuaWNlLWJhY2stY29sb3I7XG59XG4iLCIkY29sb3I6ICd5ZWxsb3cnO1xuaDUge1xuICBjb2xvcjogJGNvbG9yO1xufVxuIiwiJGgxLWZvbnQ6IDI0cHg7IFxuJGgyLWZvbnQ6IDE2cHg7IFxuXG4uYmF6IGgxIHtcbiAgZm9udC1zaXplOiAkaDEtZm9udDtcbn1cblxuLmJheiBoMiB7XG4gIGZvbnQtc2l6ZTogJGgyLWZvbnQ7XG59XG4iLCIkbmljZS1mb3JlLWNvbG9yOiAjREZEO1xuXG4uYmF6IHAge1xuICBjb2xvcjogJG5pY2UtZm9yZS1jb2xvcjtcbn1cbiIsIi5wYXJlbnQtbWFpbiB7XG4gIGRpc3BsYXk6IGJsb2NrO1xufVxuIl19'
      , 'inlines sourcemap including sources content'
    )
    t.ok(!res.map, 'returns no external map');
    t.end()
  })
})
