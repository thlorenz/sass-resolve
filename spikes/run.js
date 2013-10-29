'use strict';

var scss =  require('../lib/scss');
var fs   =  require('fs');
var path =  require('path');

var fixtures =  path.join(__dirname , 'fixtures');
var foodir   =  path.join(fixtures, 'foo');
var bardir   =  path.join(fixtures, 'bar');

var foo_body_scss = foodir + '/body.scss';
var foo_body_css = foodir + '/body.css';

scss(foo_body_scss, foo_body_css, check);

function check (err) {
  if (err) return console.error(err);
  var foo_bodyScss = fs.readFileSync(foo_body_scss, 'utf8');
  var foo_bodyCss = fs.readFileSync(foo_body_css, 'utf8');

  console.log('Rendered\n%s\n====\nTo:\n%s', foo_bodyScss, foo_bodyCss);
}
