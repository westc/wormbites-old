var express = (function(hasOwnProperty, toString) {
  return function(obj, varName, expression, optFilter, optContext) {
    // Create the context object with blank values for the variable name and the
    // iterator data (referenced by $).
    (optContext = optContext || {})[varName] = 1;
    optContext.$ = 1;
    if (!hasOwnProperty.call(optContext, 'arguments')) {
      optContext.arguments = undefined;
    }

    // Loops through the context to create the arguments list so that the
    // arguments will be passed in the correct order in the expression and
    // filter functions.
    var argNames = [], argValues = [], valueIndex, $Index;
    for (var key in optContext) {
      if (hasOwnProperty.call(optContext, key)) {
        var index = argNames.push(key) - 1;
        argValues.push(optContext[key]);
        if (key == varName) {
          valueIndex = index;
        } else if (key == '$') {
          $Index = index;
        }
      }
    }

    // Function that executes and returns the value to be stored in the returned
    // array.
    expression = Function.apply(this, argNames.concat(['return ' + expression]));

    // If the filter was supplied, redefine as a function which will return a
    // boolean indicating whether or not to add a value to the array.
    if (optFilter) {
      optFilter = Function.apply(this, argNames.concat(['return ' + optFilter]));
    }

    // Function called for each element that will be checked.
    function process(key, object) {
      argValues[$Index] = {
        key: key,
        value: argValues[valueIndex] = object[key],
        object: object
      };
      if (!optFilter || optFilter.apply(this, argValues)) {
        ret.push(expression.apply(this, argValues));
      }
    }

    // Traverse object or array to create the array of values to be returned.
    var ret = [];
    if (toString.call(obj) == '[object Array]') {
      for (var i = 0, len = obj.length; i < len; i++) {
        process(i, obj);
      }
    }
    else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          process(key, obj);
        }
      }
    }
    return ret;
  };
})({}.hasOwnProperty, {}.toString);