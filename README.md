# sass-resolve [![build status](https://secure.travis-ci.org/thlorenz/sass-resolve.png?branch=master)](http://travis-ci.org/thlorenz/sass-resolve)

Resolves all sass files in current project and all dependencies to create on sourcemapped css file from them. 

```js
var sassResolve =  require('sass-resolve');
var path        =  require('path');

var projectPath =  path.join(__dirname, 'fixtures');

sassResolve(
    projectPath    
  , { inlineSourceMap: false }
  , function (err, res) {
      if (err) return console.error(err);
      console.log(res.css);
      console.log(res.map);
    }
);
```

## Installation

    npm install sass-resolve

## Note

`sass-resolve >= v2` generates `css` using `libsass`. This eases deployment (`npm install` is all you need) and compiles
much faster (20x faster on our project) than `Ruby sass`.

If you run into problems and need to use `Ruby sass`, please `npm install sass-resolve@1` and review the [relevant
docs](https://github.com/thlorenz/sass-resolve/blob/v1/README.md) (the API has changed somewhat).

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

To get a better understanding of what options to set, please consult [these
tests](https://github.com/thlorenz/sass-resolve/blob/master/test/sass-resolve.js).

<!-- START docme generated API please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN docme TO UPDATE -->

<div>
<div class="jsdoc-githubify">
<section>
<article>
<div class="container-overview">
<dl class="details">
</dl>
</div>
<dl>
<dt>
<h4 class="name" id="sassResolve"><span class="type-signature"></span>sassResolve<span class="signature">(root, <span class="optional">opts</span>, cb)</span><span class="type-signature"></span></h4>
</dt>
<dd>
<div class="description">
<p>Resolves paths to all .scss files from the current package and its dependencies.
The location of these sass files is indicated in the &quot;main.scss&quot; field inside packags.json.
It then generates the css file including all the rules found in the resolved .scss files.
Additionally it generates a .css.map file to enable sass source maps if so desired.</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Argument</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>root</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="attributes">
</td>
<td class="description last"><p>path to the current package</p></td>
</tr>
<tr>
<td class="name"><code>opts</code></td>
<td class="type">
<span class="param-type">Object</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>configure if and how source maps are created and if a css file is written</p>
<h6>Properties</h6>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Argument</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>debug</code></td>
<td class="type">
<span class="param-type">boolean</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>(default: true) generate source maps</p></td>
</tr>
<tr>
<td class="name"><code>inlineSourceMap</code></td>
<td class="type">
<span class="param-type">boolean</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>(default: true) inline entire source map info into the .css file
instead of referring to an external .scss.map file</p></td>
</tr>
<tr>
<td class="name"><code>imports</code></td>
<td class="type">
<span class="param-type">function</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>allows overriding how imports are resolved (see: resolveScssFiles and importsFromScssFiles)</p></td>
</tr>
<tr>
<td class="name"><code>mapFileName</code></td>
<td class="type">
<span class="param-type">string</span>
</td>
<td class="attributes">
&lt;optional><br>
</td>
<td class="description last"><p>(default: 'transpiled.css.map') name of the source map file to be included
at the bottom of the generated css (not relevant when source maps are inlined)</p></td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td class="name"><code>cb</code></td>
<td class="type">
<span class="param-type">function</span>
</td>
<td class="attributes">
</td>
<td class="description last"><p>function (err, res]) {}, called when all scss files have been transpiled, when nowrite is true,
res contains generated <code>css</code> and <code>map</code> (if sourcemaps were enabled and not inlined)</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/sass-resolve/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/sass-resolve/blob/master/index.js#L17">lineno 17</a>
</li>
</ul></dd>
</dl>
</dd>
<dt>
<h4 class="name" id="sassResolve::imports"><span class="type-signature"></span>sassResolve::imports<span class="signature">(root, cb)</span><span class="type-signature"></span></h4>
</dt>
<dd>
<div class="description">
<p>Resolves all paths of all .scss files of this project and its dependencies and
generates the sass imports for them</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>root</code></td>
<td class="type">
<span class="param-type">String</span>
</td>
<td class="description last"><p>full path to the project whose sass files to resolve</p></td>
</tr>
<tr>
<td class="name"><code>cb</code></td>
<td class="type">
<span class="param-type">function</span>
</td>
<td class="description last"><p>called back with imports for the .scss files or an error if one occurred</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/sass-resolve/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/sass-resolve/blob/master/index.js#L69">lineno 69</a>
</li>
</ul></dd>
</dl>
</dd>
<dt>
<h4 class="name" id="sassResolve::resolveScssFiles"><span class="type-signature"></span>sassResolve::resolveScssFiles<span class="signature">(root, cb)</span><span class="type-signature"></span></h4>
</dt>
<dd>
<div class="description">
<p>Resolves paths to all .scss files from the current package and its dependencies.
The location of these sass files is indicated in the &quot;main.scss&quot; field inside packags.json.</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>root</code></td>
<td class="type">
<span class="param-type">String</span>
</td>
<td class="description last"><p>full path to the project whose scss files to resolve</p></td>
</tr>
<tr>
<td class="name"><code>cb</code></td>
<td class="type">
<span class="param-type">function</span>
</td>
<td class="description last"><p>called back with a list of paths to .scss files or an error if one occurred</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/sass-resolve/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/sass-resolve/blob/master/index.js#L58">lineno 58</a>
</li>
</ul></dd>
</dl>
</dd>
<dt>
<h4 class="name" id="sassResolve::scssFilesToImports"><span class="type-signature"></span>sassResolve::scssFilesToImports<span class="signature">(scssFiles)</span><span class="type-signature"> &rarr; {String}</span></h4>
</dt>
<dd>
<div class="description">
<p>Creates a .scss import string from the previously resolved sass paths (see: resolveScssFiles)
This function is called by <code>imports</code> and exposed as an advanced api if more manual tweaking is needed.</p>
</div>
<h5>Parameters:</h5>
<table class="params">
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th class="last">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="name"><code>scssFiles</code></td>
<td class="type">
<span class="param-type">Array</span>
</td>
<td class="description last"><p>paths to resolved <code>.scss</code> files</p></td>
</tr>
</tbody>
</table>
<dl class="details">
<dt class="tag-source">Source:</dt>
<dd class="tag-source"><ul class="dummy">
<li>
<a href="https://github.com/thlorenz/sass-resolve/blob/master/index.js">index.js</a>
<span>, </span>
<a href="https://github.com/thlorenz/sass-resolve/blob/master/index.js#L86">lineno 86</a>
</li>
</ul></dd>
</dl>
<h5>Returns:</h5>
<div class="param-desc">
<p>of @import statements for each <code>.scss</code> file</p>
</div>
<dl>
<dt>
Type
</dt>
<dd>
<span class="param-type">String</span>
</dd>
</dl>
</dd>
</dl>
</article>
</section>
</div>

*generated with [docme](https://github.com/thlorenz/docme)*
</div>
<!-- END docme generated API please keep comment here to allow auto update -->

## Examples

### `debug: true, inlineSourceMap: false, mapFileName: 'my.css.map'`

Will generate source maps and inline the sources of all original files.

These source map is returned as `res.map` which you'll have to serve as `/my.css.map`.

### `debug: true, inlineSourceMap: true`

Will generate source maps and instead of referring to a separate `res.map`. all source map data is inlined at the bottom of the css. 
Therefore you don't have to serve the source map, but keep in mind that now it adds to the size of the `css` loaded, so
only use this option in development.

## License

MIT
