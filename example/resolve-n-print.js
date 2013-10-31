'use strict';

var sassResolve =  require('../');
var path        =  require('path');
var fs          =  require('fs');

var cssFile     =  path.join(__dirname, '..', 'test', 'fixtures', 'imports.css');
var projectPath =  path.join(__dirname, '..', 'test', 'fixtures');

sassResolve(
    projectPath    
  , cssFile 
  , function (err) {
      if (err) return console.error(err);
      var css = fs.readFileSync(cssFile, 'utf8');
      console.log(css);
    }
);
