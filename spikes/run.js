'use strict';

var scss =  require('../lib/scss');
var fs   =  require('fs');
var path =  require('path');

var fixtures =  path.join(__dirname , 'fixtures');
var foodir   =  path.join(fixtures, 'foo');
var bardir   =  path.join(fixtures, 'bar');

var foo_body_scss = foodir + '/index.scss';

var index_scss = fixtures + '/index.scss';
var index_css = fixtures + '/index.css';

scss(index_scss, index_css, check);

function check (err) {
  if (err) return console.error(err);
  var indexScss = fs.readFileSync(index_scss, 'utf8');
  var indexCss = fs.readFileSync(index_css, 'utf8');

  console.log('Rendered\n%s\n====\nTo:\n%s', indexScss, indexCss);
}
