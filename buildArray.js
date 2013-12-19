/**
 * Builds an array either from another array or an object using the values.
 * @param {Array|Object|number} obj  If an array or object is given all of its
 *     items will be traversed.  If a number is given, an array with that length
 *     will be created and then traversed.
 * @param {string|Function|undefined} expression  Optional function or function
 *     expression that if the filter passes will be executed and the returned
 *     value will be placed in the array to be returned by this function.  If a
 *     string is specified, the context object (this) will be obj, the value
 *     will be $value and the key will be $key.  If a function is specified, the
 *     context object (this) will be obj, the key will be the first parameter
 *     and the value the second parameter.  If not specified and obj is number
 *     the value to be added to the returned array will be the key.  If not
 *     specified and obj is not a number, the value to be added to the returned
 *     array will be the value found.
 * @param {string|Function|undefined} optFilter  Optional function or function
 *     expression that will be evaluated for each value and only if a true-ish
 *     value results will the expression be evaluated and the resulting value
 *     added to the built array.  If a string is specified, the context object
 *     (this) will be obj, the value will be $value and the key will be $key.
 *     If a function is specified, the context object (this) will be obj, the
 *     key will be the first parameter and the value the second parameter.
 * @return {!Array}  The array built from the values returned from expression.
 */
var buildArray = (function(toString, undefined) {
  // Internal function which checks the type of an object or primitive
  // (excluding null and undefined).
  function typeIs(obj, typeName) {
    return toString.call(obj).slice(8, -1) == typeName;
  }

  return function(obj, expression, optFilter) {
    // If a number is passed instead of an array or object, create a blank array
    // with that length.
    var objWasNumber = typeIs(obj, 'Number');
    if (objWasNumber) {
        obj = new Array(obj);
    }

    // Make sure the expression is a function.
    if (expression == undefined) {
      expression = objWasNumber ? '$key' : '$value';
    }
    if (typeIs(expression, 'String')) {
      expression = new Function('$value', '$key', 'return ' + expression);
    }

    // If given make sure the filter is a function.
    if (optFilter && typeIs(optFilter, 'String')) {
      optFilter = new Function('$value', '$key', 'return ' + optFilter);
    }

    // This is called for each item in obj and is used to execute the filter (if
    // given) and then add the processed value to the array to be returned.
    function process(key) {
      var value = obj[key];
      if (!optFilter || optFilter.call(obj, value, key)) {
        ret.push(expression.call(obj, value, key));
      }
    }

    // Create the array, build it out, and return it.
    var ret = [];
    if (typeIs(obj, 'Array')) {
      for (var i = 0, len = obj.length; i < len; i++) {
        process(i);
      }
    }
    else {
      for (var key in obj) {
        process(key);
      }
    }
    return ret;
  };
})({}.toString);

buildArray(10)