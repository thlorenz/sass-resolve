'use strict';

function ultraComplexSortOperation(hash) {
  var sorted = [];

  // This works via multipass to make it simple
  // Most likely a better and more performant solution exists, 
  // but we expect no more than 100 paths here and my brain is fried ATM

  // fist of all we rearrange things so that we are dealing with children instead of parents
  Object.keys(hash)
    .forEach(function (k) {
      var val = hash[k];
      if (!val.parent) return;
      if (!hash[val.parent].children) hash[val.parent].children = [];
      hash[val.parent].children.push(k);
    })

  // ok now we'll cycle through all of them starting with the ones that have no children
  var tasks = Object.keys(hash).map(function (k) { return hash[k] });
  var added = {};

  // ok to speed things up at least a bit we can sort by number of children
  // in most cases this actually results in the process loop only having to run once
  tasks = tasks.sort(function (x, y) {
    if (!x.children || !x.children.length) return -1;
    if (!y.children || !y.children.length) return 1;
    return x.children.length < y.children.length ? -1 : 1;
  })

  function process(t, idx) {
    function we_have_a_winner() {
      sorted.push(t.path);
      added[t.path] = true;
    }

    if (!t.children || !t.children.length) return we_have_a_winner();

    // for the ones with children we need to make sure all children were added in a previous pass
    var allChildrenCovered = !t.children.some(function (x) { return !added[x] })
    if (allChildrenCovered) we_have_a_winner();
  }

  while (tasks.length) { 
    tasks.forEach(process);  
    /*jshint loopfunc: true */
    tasks = tasks.filter(function (x) { return !added[x.path] });
  }

  return sorted;
}

var go = module.exports = 

/**
 * Takes an array of scss files which have file path and parent set, sorts
 * them in order to ensure that children come before parents
 * and returns a list of sorted files
 * 
 * @name  resolveSassPaths
 * @function
 * @private
 * @param {Array.<Object>} scssFiles scssFiles which each have `{ parent: 'fullpath to parent', path: 'fullpath' }` properties
 * @return {Array.<string>} sorted scss file full paths
 */
function (scssFiles) {
  var hash = scssFiles
    .reduce(function (acc, info) {
      acc[info.path] = info; 
      return acc;
    }, {});

  return ultraComplexSortOperation(hash);
}
