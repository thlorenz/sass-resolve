'use strict';
/*jshint asi: true */

var test = require('tap').test
var sort = require('../lib/sort-sass-paths')

function insp(obj, depth) {
  return require('util').inspect(obj, false, depth || 5, true);
}

var scssFiles = [ 
  { path: '1',  parent: undefined }
, { path: '2',  parent: '1' }
, { path: '3',  parent: '1' }
, { path: '4',  parent: '2' }
, { path: '5',  parent: '2' }
, { path: '6',  parent: '3' }
, { path: '7',  parent: '4' }
]

test('\nsorting\n' + insp(scssFiles), function (t) {
  var expected = [ '5', '6', '7', '4', '3', '2', '1' ]
  
  t.deepEqual(sort(scssFiles), expected, 'sorts them to ' + expected + ' to ensure child dependencies come before their parent')
  t.end()
})
