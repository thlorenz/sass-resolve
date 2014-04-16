'use strict';

function ultraComplexSortOperation(info) {
  var sorted = [];
  var deptree = info.deptree;
  var files = info.files; 

  // This works via multipass to make it simple
  // Most likely a better and more performant solution exists, 
  // but we expect no more than 100 paths here and my brain is fried ATM

  var handled = {};

  function process(t, idx) {
    var deps = deptree[t];

    function we_have_a_winner() {
      if (files[t]) sorted.push(files[t]);
      handled[t] = true;
    }

    if (!deps || !deps.length) return we_have_a_winner();

    // for the ones with children we need to make sure all children 
    // that export scss were handled in a previous pass  
    var allChildrenCovered = !deps.some(function (x) { 
      return !handled[x] //&& files[x]
    })
    if (allChildrenCovered) return we_have_a_winner();
  }

  var tasks = Object.keys(deptree);

  while (tasks.length) { 
    tasks.forEach(process);  
    /*jshint loopfunc: true */
    tasks = tasks.filter(function (x) { return !handled[x] });
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
 * @param {Object.<string, Object>} info scssFiles and dependency information 
 * @param {Object.<string, string>} info.files { package_name: fullPathToScssFile }
 * @param {Object.<string, Array.<string>>} info.deptree { package_name: dependencies }
 * @return {Array.<string>} sorted scss file full paths
 */
function (info) {
  return ultraComplexSortOperation(info);
}
