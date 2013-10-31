'use strict';
/*jshint asi: true */

var test = require('tap').test
var path = require('path')
var sassResolve = require('../')
var fixtures = path.join(__dirname, 'fixtures-broken');

test('\nwhen creating imports from fixture with broken scss', function (t) {
  sassResolve(fixtures, path.join(fixtures, 'index.css'), function (err) {
    t.ok(err, 'calls back with error');
    t.end()
  });
})
