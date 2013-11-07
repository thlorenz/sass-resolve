'use strict';
/*jshint asi: true */

var debug =  false;
var test  =  debug  ? function () {} : require('tap').test
var test_ =  !debug ? function () {} : require('tap').test

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

var sourcesContent = [
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
  sassResolve(root, cssFile, opts, function (err, retcss) {
    if (err) return cb(err);
    fs.readFile(cssFile, 'utf8', function (err, css) {
      cb(err, css, retcss)
    }) 
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
    transpileNread({ debug: false }, function (err, css, retcss) {
      if (err) return t.fail(err)  
      t.equal(lastLine(css), '', 'does not generate any sourcemaps')
      t.ok(!retcss, 'returns no css')
      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourcesContent: off, inlineSourceMap: off', function (t) {
    transpileNread({ debug: true, inlineSourcesContent: false, inlineSourceMap: false }, function (err, css, retcss) {
      if (err) return t.fail(err)  
      var sm = mapFromFile();

      t.equal(lastLine(css), '/*# sourceMappingURL=transpiled.css.map */', 'generates sourcemap pointing to map file')
      t.deepEqual(sm.sources, sources, 'includes correct sources')
      t.equal(sm.file, 'transpiled.css', 'includes name of file that contains transpiled css')
      t.ok(!sm.sourcesContent, 'does not resolve sources content')
      t.ok(!retcss, 'returns no css')
      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourcesContent: on, inlineSourceMap: off', function (t) {
    transpileNread({ debug: true, inlineSourcesContent: true, inlineSourceMap: false }, function (err, css, retcss) {
      if (err) return t.fail(err)  
      var sm = mapFromFile();

      t.equal(lastLine(css), '/*# sourceMappingURL=transpiled.css.map */', 'generates sourcemap pointing to map file')
      t.deepEqual(sm.sources, sources, 'includes correct sources')
      t.equal(sm.file, 'transpiled.css', 'includes name of file that contains transpiled css')
      t.deepEqual(sm.sourcesContent, sourcesContent, 'includes sourcesContent')
      t.ok(!retcss, 'returns no css')

      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourcesContent: off, inlineSourceMap: on', function (t) {
    transpileNread({ debug: true, inlineSourcesContent: false, inlineSourceMap: true }, function (err, css, retcss) {
      if (err) return t.fail(err)  

      t.equal(
        lastLine(css)
        , '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjoiMyIsIm1hcHBpbmdzIjoiQUFFQSxTQUFVO0VBQ1IsS0FBSyxFQUhTLE9BQUk7O0FDRXBCLE1BQU87RUFDTCxVQUFVLEVBSE0sT0FBSTs7QUNDdEIsRUFBRztFQUNELEtBQUssRUFGQyxRQUFROztBQ0doQixPQUFRO0VBQ04sU0FBUyxFQUpELElBQUk7O0FBT2QsT0FBUTtFQUNOLFNBQVMsRUFQRCxJQUFJOztBQ0NkLE1BQU87RUFDTCxLQUFLLEVBSFcsT0FBSTs7QUNBdEIsWUFBYTtFQUNYLE9BQU8sRUFBRSxLQUFLIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvZm9vL3Nhc3MvYm9keS5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9zYXNzL3BhcmFncmFwaC5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9ub2RlX21vZHVsZXMvZm9vei9zYXNzL21haW4uc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL2hlYWRlcnMuc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL3BhcmFncmFwaC5zY3NzIiwic2Fzcy9tYWluLnNjc3MiXSwiZmlsZSI6InRyYW5zcGlsZWQuY3NzIn0='
        , 'inlines sourcemap'
      )
      t.ok(!retcss, 'returns no css')
      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourcesContent: on, inlineSourceMap: on', function (t) {
    transpileNread({ debug: true, inlineSourcesContent: true, inlineSourceMap: true }, function (err, css, retcss) {
      if (err) return t.fail(err)  

      t.equal(
        lastLine(css)
        , '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjoiMyIsIm1hcHBpbmdzIjoiQUFFQSxTQUFVO0VBQ1IsS0FBSyxFQUhTLE9BQUk7O0FDRXBCLE1BQU87RUFDTCxVQUFVLEVBSE0sT0FBSTs7QUNDdEIsRUFBRztFQUNELEtBQUssRUFGQyxRQUFROztBQ0doQixPQUFRO0VBQ04sU0FBUyxFQUpELElBQUk7O0FBT2QsT0FBUTtFQUNOLFNBQVMsRUFQRCxJQUFJOztBQ0NkLE1BQU87RUFDTCxLQUFLLEVBSFcsT0FBSTs7QUNBdEIsWUFBYTtFQUNYLE9BQU8sRUFBRSxLQUFLIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvZm9vL3Nhc3MvYm9keS5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9zYXNzL3BhcmFncmFwaC5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9ub2RlX21vZHVsZXMvZm9vei9zYXNzL21haW4uc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL2hlYWRlcnMuc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL3BhcmFncmFwaC5zY3NzIiwic2Fzcy9tYWluLnNjc3MiXSwiZmlsZSI6InRyYW5zcGlsZWQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiJHByaW1hcnktY29sb3I6ICMzMzM7XG5cbi5mb28gYm9keSB7XG4gIGNvbG9yOiAkcHJpbWFyeS1jb2xvcjtcbn1cbiIsIiRuaWNlLWJhY2stY29sb3I6ICMzMzM7XG5cbi5mb28gcCB7XG4gIGJhY2tncm91bmQ6ICRuaWNlLWJhY2stY29sb3I7XG59XG4iLCIkY29sb3I6ICd5ZWxsb3cnO1xuaDUge1xuICBjb2xvcjogJGNvbG9yO1xufVxuIiwiJGgxLWZvbnQ6IDI0cHg7IFxuJGgyLWZvbnQ6IDE2cHg7IFxuXG4uYmF6IGgxIHtcbiAgZm9udC1zaXplOiAkaDEtZm9udDtcbn1cblxuLmJheiBoMiB7XG4gIGZvbnQtc2l6ZTogJGgyLWZvbnQ7XG59XG4iLCIkbmljZS1mb3JlLWNvbG9yOiAjREZEO1xuXG4uYmF6IHAge1xuICBjb2xvcjogJG5pY2UtZm9yZS1jb2xvcjtcbn1cbiIsIi5wYXJlbnQtbWFpbiB7XG4gIGRpc3BsYXk6IGJsb2NrO1xufVxuIl19'
        , 'inlines sourcemap including sources content'
      )
      t.ok(!retcss, 'returns no css')
      t.end()
    })
  })

  // nowrite option
  test('\nwhen transpiling with debug flag off, nowrite on', function (t) {
    transpileNread({ debug: false, nowrite: true }, function (err, css, retcss) {
      if (err) return t.fail(err)  
      t.equal(lastLine(css), '', 'does not generate any sourcemaps')
      t.equal(retcss, css, 'returns css which is the same as is contained in css file')
      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourcesContent: off, inlineSourceMap: off, nowrite: on', function (t) {
    transpileNread({ debug: true, inlineSourcesContent: false, inlineSourceMap: false, nowrite: true }, function (err, css, retcss) {
      if (err) return t.fail(err)  
      var sm = mapFromFile();

      t.equal(lastLine(css), '/*# sourceMappingURL=transpiled.css.map */', 'generates sourcemap pointing to map file')
      t.deepEqual(sm.sources, sources, 'includes correct sources')
      t.equal(sm.file, 'transpiled.css', 'includes name of file that contains transpiled css')
      t.ok(!sm.sourcesContent, 'does not resolve sources content')
      t.equal(retcss, css, 'returns css which is the same as is contained in css file')
      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourcesContent: on, inlineSourceMap: off, nowrite: on', function (t) {
    transpileNread({ debug: true, inlineSourcesContent: true, inlineSourceMap: false, nowrite: true }, function (err, css, retcss) {
      if (err) return t.fail(err)  
      var sm = mapFromFile();

      t.equal(lastLine(css), '/*# sourceMappingURL=transpiled.css.map */', 'generates sourcemap pointing to map file')
      t.deepEqual(sm.sources, sources, 'includes correct sources')
      t.equal(sm.file, 'transpiled.css', 'includes name of file that contains transpiled css')
      t.deepEqual(sm.sourcesContent, sourcesContent, 'includes sourcesContent')
      t.equal(retcss, css, 'returns css which is the same as is contained in css file')

      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourcesContent: off, inlineSourceMap: on, nowrite: on', function (t) {
    transpileNread({ debug: true, inlineSourcesContent: false, inlineSourceMap: true, nowrite: true }, function (err, css, retcss) {
      if (err) return t.fail(err)  

      t.equal(lastLine(css), '/*# sourceMappingURL=transpiled.css.map */', 'css in cssFile is not changed and still contains map pointing to map file')
      t.equal(
        lastLine(retcss)
        , '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjoiMyIsIm1hcHBpbmdzIjoiQUFFQSxTQUFVO0VBQ1IsS0FBSyxFQUhTLE9BQUk7O0FDRXBCLE1BQU87RUFDTCxVQUFVLEVBSE0sT0FBSTs7QUNDdEIsRUFBRztFQUNELEtBQUssRUFGQyxRQUFROztBQ0doQixPQUFRO0VBQ04sU0FBUyxFQUpELElBQUk7O0FBT2QsT0FBUTtFQUNOLFNBQVMsRUFQRCxJQUFJOztBQ0NkLE1BQU87RUFDTCxLQUFLLEVBSFcsT0FBSTs7QUNBdEIsWUFBYTtFQUNYLE9BQU8sRUFBRSxLQUFLIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvZm9vL3Nhc3MvYm9keS5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9zYXNzL3BhcmFncmFwaC5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9ub2RlX21vZHVsZXMvZm9vei9zYXNzL21haW4uc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL2hlYWRlcnMuc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL3BhcmFncmFwaC5zY3NzIiwic2Fzcy9tYWluLnNjc3MiXSwiZmlsZSI6InRyYW5zcGlsZWQuY3NzIn0='
        , 'returned css contains inlined sourcemap'
      )
      t.end()
    })
  })

  test('\nwhen transpiling with debug: on, inlineSourcesContent: on, inlineSourceMap: on, nowrite: on', function (t) {
    transpileNread({ debug: true, inlineSourcesContent: true, inlineSourceMap: true, nowrite: true }, function (err, css, retcss) {
      if (err) return t.fail(err)  

      t.equal(lastLine(css), '/*# sourceMappingURL=transpiled.css.map */', 'css in cssFile is not changed and still contains map pointing to map file')
      t.equal(
        lastLine(retcss)
        , '//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjoiMyIsIm1hcHBpbmdzIjoiQUFFQSxTQUFVO0VBQ1IsS0FBSyxFQUhTLE9BQUk7O0FDRXBCLE1BQU87RUFDTCxVQUFVLEVBSE0sT0FBSTs7QUNDdEIsRUFBRztFQUNELEtBQUssRUFGQyxRQUFROztBQ0doQixPQUFRO0VBQ04sU0FBUyxFQUpELElBQUk7O0FBT2QsT0FBUTtFQUNOLFNBQVMsRUFQRCxJQUFJOztBQ0NkLE1BQU87RUFDTCxLQUFLLEVBSFcsT0FBSTs7QUNBdEIsWUFBYTtFQUNYLE9BQU8sRUFBRSxLQUFLIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvZm9vL3Nhc3MvYm9keS5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9zYXNzL3BhcmFncmFwaC5zY3NzIiwibm9kZV9tb2R1bGVzL2Zvby9ub2RlX21vZHVsZXMvZm9vei9zYXNzL21haW4uc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL2hlYWRlcnMuc2NzcyIsIm5vZGVfbW9kdWxlcy9iYXIvbm9kZV9tb2R1bGVzL2Jhei9zYXNzL3BhcmFncmFwaC5zY3NzIiwic2Fzcy9tYWluLnNjc3MiXSwiZmlsZSI6InRyYW5zcGlsZWQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiJHByaW1hcnktY29sb3I6ICMzMzM7XG5cbi5mb28gYm9keSB7XG4gIGNvbG9yOiAkcHJpbWFyeS1jb2xvcjtcbn1cbiIsIiRuaWNlLWJhY2stY29sb3I6ICMzMzM7XG5cbi5mb28gcCB7XG4gIGJhY2tncm91bmQ6ICRuaWNlLWJhY2stY29sb3I7XG59XG4iLCIkY29sb3I6ICd5ZWxsb3cnO1xuaDUge1xuICBjb2xvcjogJGNvbG9yO1xufVxuIiwiJGgxLWZvbnQ6IDI0cHg7IFxuJGgyLWZvbnQ6IDE2cHg7IFxuXG4uYmF6IGgxIHtcbiAgZm9udC1zaXplOiAkaDEtZm9udDtcbn1cblxuLmJheiBoMiB7XG4gIGZvbnQtc2l6ZTogJGgyLWZvbnQ7XG59XG4iLCIkbmljZS1mb3JlLWNvbG9yOiAjREZEO1xuXG4uYmF6IHAge1xuICBjb2xvcjogJG5pY2UtZm9yZS1jb2xvcjtcbn1cbiIsIi5wYXJlbnQtbWFpbiB7XG4gIGRpc3BsYXk6IGJsb2NrO1xufVxuIl19'
        , 'returned css contains inlined sourcemap including sources content'
      )
      t.end()
    })
  })
}
