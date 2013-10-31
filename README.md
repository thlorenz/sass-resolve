# sass-resolve [![build status](https://secure.travis-ci.org/thlorenz/sass-resolve.png)](http://travis-ci.org/thlorenz/sass-resolve)

Resolves all sass files in current project and all dependencies to create on sourcemapped css file fromt them. 

```js
var sassResolve =  require('sass-resolve');
var path        =  require('path');
var fs          =  require('fs');

var cssFile     =  path.join(__dirname, 'fixtures', 'imports.css');
var projectPath =  path.join(__dirname, 'fixtures');

sassResolve(
    projectPath    
  , cssFile 
  , function (err) {
      if (err) return console.error(err);
      var css = fs.readFileSync(cssFile, 'utf8');
      console.log(css);
    }
);
```

## Installation

    npm install sass-resolve

## API

### **sassResolve(root, cssFile, cb)**

```
/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "sass" field inside packags.json.
 * It then generates the css file including all the rules found in the resolved .scss files.
 * Additionally it generates a .css.map file to enable sass source maps. 
 *
 * NOTE: at this point sass 3.3 is still not officially released, but required to get sourcemaps.
 * 
 * @name sassResolve
 * @function
 * @param root {String} path to the current package
 * @param cssFile {String} path at which the resulting css file should be saved, the .css.map file is saved right next to it
 * @param cb {Function} called back with an error or null when the css file was successfully generated.
 */
```

### **sassResolve.paths(root, cb)**

```
/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "sass" field inside packags.json.
 * 
 * @name resolveSassPaths
 * @function
 * @param root {String} full path to the project whose sass files to resolve
 * @param cb {Function} called back with a list of paths to .scss files or an error if one occurred
 */
```

### **sassResolve.imports(root, cb)**

```
/**
 * Resolves all paths of all .scss files of this project and its dependencies and 
 * generates the sass imports for them
 * 
 * @name imports
 * @function
 * @param root {String} full path to the project whose sass files to resolve
 * @param cb {Function} called back with imports for the .scss files or an error if one occurred
 */
```

## Note

Sourcemaps compatible with Chrome and Firefox only get generated properly with `sass v3.3+` and not at all with
`libsass` at this point -- the latter is very sad :(.

Therefore please do: 

    [sudo] gem install sass -v '>=3.3.0alpha' --pre 
    
if you want them (and you should).

To find out more please visit [this very informative post](https://medium.com/what-i-learned-building/b4daab987fb0).

## License

MIT
