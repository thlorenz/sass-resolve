'use strict';

var resolveSassPaths =  require('./lib/resolve-sass-paths')
 , scss              =  require('./lib/scss')
 , os                =  require('os')
 , path              =  require('path')
 , fs                =  require('fs')
 , xtend             =  require('xtend')
 , deserialize       =  require('./lib/deserialize-mapfile')
 , resolveSources    =  require('./lib/resolve-scss-sources')
 , convertSourceMap  =  require('convert-source-map')
 ;

var tmpdir = os.tmpDir();
var genImportsPath = path.join(tmpdir, 'sass-resolve-generated-imports.scss');

var defaultOpts = { debug: true, inlineSourcesContent: true, inlineSourceMap: true, nowrite: false };

function persistMap(cssFile, conv, inlineSourceMap, nowrite, cb) {
  if (!inlineSourceMap) { 
    fs.writeFile(cssFile + '.map', conv.toJSON(2), 'utf8', function (err) {
      if (err) return cb(err);
      if (!nowrite) return cb();
      fs.readFile(cssFile, 'utf8', cb);
    });
    return;
  }

  // In case we are supposed to inline the source map, we do the following
  // - remove source map pointing to map file
  // - add the sourcemap with all information inlined to the bottom of the content
  // - overwrite the original .css file with the content (unless nowrite was set)
  fs.readFile(cssFile, 'utf8', adaptCss);

  function adaptCss(err, css) {
    if (err) return cb(err);

    css = convertSourceMap.removeMapFileComments(css); 
    css += '\n' + conv.toComment();

    if (nowrite) return cb(null, css);
    fs.writeFile(cssFile, css, 'utf8', function (err) {
      if (err) return cb(err);
      cb(null, nowrite ? css : null);  
    });  
  }

}

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
 * @param cb {Function} called back with an error or null when the css file was successfully generated.
 */
exports = module.exports = function (root, cssFile, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = xtend(defaultOpts, opts);

  function noadapt() {
    if (!opts.nowrite) return cb();
    fs.readFile(cssFile, 'utf8', cb);
  }

  function adaptMap(err) {
    if (err) return cb(err);
    if (!opts.debug) return noadapt();
    if (!opts.inlineSourcesContent && !opts.inlineSourceMap) return noadapt();

    deserialize(cssFile, function (err, conv) {
      if (err) return cb(err);
      if (opts.inlineSourcesContent) {
        // resolving sources will add them as 'sourcesContent' to conv
        resolveSources(cssFile, conv, function (err) {
          if (err) return cb(err);
          persistMap(cssFile, conv, opts.inlineSourceMap, opts.nowrite, cb);
        })
      } else {
        persistMap(cssFile, conv, opts.inlineSourceMap, opts.nowrite, cb);
      }
    })

  }
  
  imports(root, function (err, src) {
    if (err) return cb(err);
    // the imports contain absolute paths, so it doesn't matter where the import file ends up
    fs.writeFile(genImportsPath, src, 'utf8', function (err) {
      if (err) return cb(err);
      scss(genImportsPath, cssFile, opts.debug, adaptMap);
    });
  });  
}

/**
 * Resolves paths to all .scss files from the current package and its dependencies.
 * The location of these sass files is indicated in the "main.scss" field inside packags.json.
 * 
 * @name resolveSassPaths
 * @function
 * @param root {String} full path to the project whose sass files to resolve
 * @param cb {Function} called back with a list of paths to .scss files or an error if one occurred
 */
exports.paths = resolveSassPaths;

/**
 * Resolves all paths of all .scss files of this project and its dependencies and 
 * generates the sass imports for them
 * 
 * @name imports
 * @function
 * @param root {String} full path to the project whose sass files to resolve
 * @param cb {Function} called back with imports for the .scss files or an error if one occurred
 */
var imports = exports.imports = function (root, cb) {
  resolveSassPaths(root, function (err, scssFiles) {
    if (err) return cb(err);
    var imports = scssFiles.map(function (f) {
      return '@import "' + f + '";';
    }).join('\n');

    cb(null, imports);
  });
}
