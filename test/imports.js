'use strict';
/*jshint asi: true */

var test = require('tap').test
var path = require('path')
var imports = require('../').imports
var fixtures = path.join(__dirname, 'fixtures');

test('\nwhen createing imports from fixture', function (t) {
  imports(fixtures, function (err, res) {
    if (err) return t.fail(err);  
    var relImports = res.replace(new RegExp(fixtures, 'g'), '').split('\n');

    [ '@import "/node_modules/foo/sass/index.scss";'
    , '@import "/node_modules/foo/node_modules/fooz/sass/index.scss";'
    , '@import "/node_modules/bar/node_modules/baz/sass/index.scss";'
    , '@import "/sass/index.scss";'].forEach(function (imp) {
      
        t.ok(~relImports.indexOf(imp), 'resolves ' + imp)
    });
    t.end()
  });
})
