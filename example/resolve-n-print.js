'use strict';

var sassResolve =  require('../');
var path        =  require('path');

var projectPath =  path.join(__dirname, '..', 'test', 'fixtures');

sassResolve(
    projectPath    
  , { inlineSourceMap: false }
  , function (err, res) {
      if (err) return console.error(err);
      console.log(res.css);
      console.log(res.map);
    }
);
