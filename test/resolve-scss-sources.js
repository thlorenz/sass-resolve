'use strict';
/*jshint asi: true */

var test = require('tap').test
var fs = require('fs')
var path = require('path')
var resolveSources = require('../lib/resolve-scss-sources')
var convert =  require('convert-source-map')

var root = path.join(__dirname, 'css-with-sourcemaps');
var cssFile = path.join(root, 'sample.css');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function deserialize(cssFile, cb) {
  fs.readFile(cssFile, 'utf8',  function (err, css) {
    if (err) return cb(err);
    var conv = convert.fromMapFileSource(css, root);
    cb(null, conv)
  });
}

test('\nwhen resolving a source map from a .css file whose sourcemap comment points at a valid .css.map file', function (t) {
  
  deserialize(cssFile, function (err, conv) {
    if (err) { t.fail(err); return t.end(); }

    resolveSources(root, conv, function (err) {
      if (err) { t.fail(err); return t.end(); }

      t.deepEqual(
          conv.toObject().sources
        , [ '../fixtures/node_modules/foo/sass/body.scss',
            '../fixtures/node_modules/foo/sass/paragraph.scss',
            '../fixtures/node_modules/foo/node_modules/fooz/sass/main.scss',
            '../fixtures/node_modules/bar/node_modules/baz/sass/headers.scss',
            '../fixtures/node_modules/bar/node_modules/baz/sass/paragraph.scss',
            '../fixtures/sass/main.scss' ]
        , 'resolves all sources'
      )
      
      t.deepEqual(
          conv.toObject().sourcesContent
        , [ '$primary-color: #333;\n\n.foo body {\n  color: $primary-color;\n}\n',
            '$nice-back-color: #333;\n\n.foo p {\n  background: $nice-back-color;\n}\n',
            '$color: \'yellow\';\nh5 {\n  color: $color;\n}\n',
            '$h1-font: 24px; \n$h2-font: 16px; \n\n.baz h1 {\n  font-size: $h1-font;\n}\n\n.baz h2 {\n  font-size: $h2-font;\n}\n',
            '$nice-fore-color: #DFD;\n\n.baz p {\n  color: $nice-fore-color;\n}\n',
            '.parent-main {\n  display: block;\n}\n' ]
        , 'resolves all sources contents'
      )

      // for manual inspection we write this file to the fixture folder
      fs.writeFileSync(path.join(__dirname, 'css-with-sourcemaps', 'sample-inlined.css.map'), conv.toJSON(2), 'utf8')

      console.log('wrote sample-inlined.css.map, to test:\nopen test/css-with-sourcemaps/index.html');

      t.end()
    })
  });
})
