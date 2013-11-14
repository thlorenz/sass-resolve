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

## Note

Sourcemaps compatible with Chrome and Firefox only get generated properly with `sass v3.3+` and not at all with
`libsass` at this point -- the latter is very sad :(.

Therefore please do: 

    [sudo] gem install sass -v '>=3.3.0alpha' --pre 
    
if you want them (and you should).

To find out more please visit [this very informative post](https://medium.com/what-i-learned-building/b4daab987fb0).

## API

### package.json

In order for resolve-sass to be able to find your `.scss` files you need to specify an `.scss` entry file via the
`main.scss` field in the `package.json` of each project that has `.scss` files.  

The entry `.scss` file should specify an `@import` for each `.scss` file you want to include.

#### Example


```json
// package.json
{
  [..]
  "main.scss": "sass/index.scss",
  [..]
}
```

```scss
// sass/index.scss
@import "foo";
@import "bar";
```

Please investigate these [fixtures](https://github.com/thlorenz/sass-resolve/tree/master/test/fixtures) for more information.

### **sassResolve(root, cssFile[, opts], cb)**

```
/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "main.scss" field inside packags.json.
 * It then generates the css file including all the rules found in the resolved .scss files.
 * Additionally it generates a .css.map file to enable sass source maps. 
 *
 * NOTE: at this point sass 3.3 is still not officially released, but required to get sourcemaps.
 * 
 * @name sassResolve
 * @function
 * @param root {String} path to the current package
 * @param cssFile {String} path at which the resulting css file should be saved, the .css.map file is saved right next to it
 * @param opts {Object} (optional) configure if and how source maps are created:
 *  - debug (true) generate source maps
 *  - inlineSourcesContent (true) inline mapped (.scss) content instead of referring to original the files separately 
 *  - inlineSourceMap (true) inline entire source map info into the .css file  instead of referring to an external .scss.map file
 *  - nowrite (false) if true the css will be included as the result and the css file will not be rewritten in case changes are applied
 *  - imports (optional) allows overriding how imports are resolved (see: resolveScssFiles and importsFromScssFiles)
 * @param cb {Function} function (err[, css]) {}, called when all scss files have been transpiled, when nowrite is true,
 * the generated css is included in the response, otherwise all data is written to the css file
 */
```

To get a better understanding of what options to set, please consult [these
tests](https://github.com/thlorenz/sass-resolve/blob/master/test/sass-resolve.js).

Here are a few examples:

##### `debug: true, inlineSourcesContent: true, inlineSourceMap: false, nowrite: false`

Will generate source maps and inline the sources of all original files.

These source maps are saved into the `.css.map` file and no css is returned.

##### `debug: true, inlineSourcesContent: false, inlineSourceMap: true, nowrite: true`

Will generate source maps, but not inline the sources of original files. However instead of referring to an external
`.css.map` file, all source map data is added to the bottom of the css. Since `nowrite` is desired, that update is not
written to the generated `.css` file. The css with added source maps is returned.


### **sassResolve.resolveScssFiles(root, cb)**

```
/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "main.scss" field inside packags.json.
 * 
 * @name resolveScssFiles
 * @function
 * @param root {String} full path to the project whose scss files to resolve
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

###**sassResolve.scssFilesToImports(scssFiles)**

```
/**
 * Creates a .scss import string from the previously resolved sass paths (see: paths)
 * This function is called by `imports` and exposed as an advanced api if more manual tweaking is needed.
 * 
 * @name scssFilesToImports
 * @function
 * @param scssFiles {Array} paths to resolved `.scss` files
 * @return {String} of @import statements for each `.scss` file
 */

```

## License

MIT
