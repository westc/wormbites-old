/**
 * Creates a class using the specified constructor and options.
 * @param  {!Function} constructor  The constructor function.
 * @param  {{ privateKey:string, setters:Array<string>, getters:Array<string>, prototype:Object<!Function>, properties:Object }} options
 *     Object containing the class options.  The privateKey is the name of the
 *     privateKey that will be assigned to every instance.  During the
 *     invocation of a prototypal function this property will change from a
 *     function into a object containing all of the private data members.  The
 *     setters array contains names of private data members for which setters
 *     will be setup.  The getters array contains names of private data members
 *     for which getters will be setup.  The prototype object will contain the
 *     prototype values that will be attached to the class' prototype.
 * @return {!Function}  The newly created class with all properly hidden
 *     private members hidden.  All setters will return the previous value.
 */
var classify = (function(emptyObject, global, undefined) {
  var hasOwnProperty = emptyObject.hasOwnProperty;
  var typeOf = function(o, p) {
    o = o === global
      ? "global"
      : o == undefined
        ? o === undefined
          ? "undefined"
          : "null"
        : emptyObject.toString.call(o).slice(8, -1);
    return p ? p === o : o;
  };

  function camelCase(str, delim) {
    delim = delim || ' ';
    var pos;
    while ((pos = str.indexOf(delim)) + 1) {
      str = str.slice(0, pos) + str.charAt(pos + 1).toUpperCase() + str.slice(pos + 2);
    }
    return str;
  }

  // Return classify function.
  return function(constructor, options) {
    var outerPrivateData;

    var privateKey = options.privateKey || '_';

    var realConstructor = function() {
      var ret = constructor.apply(this, arguments);

      var privateData = this[privateKey];
      if (!typeOf(privateData, 'Object')) {
        privateData = {};
      }

      // The getter for private data.
      this[privateKey] = function() {
        outerPrivateData = privateData;
      };

      return ret;
    };

    // Add class level properties.
    var properties = options.properties;
    if (properties) {
      for (var key in properties) {
        realConstructor[key] = properties[key];
      }
    }

    var realPrototype = realConstructor.prototype;
    var myPrototype = options.prototype || {};

    // Add getters.
    var getters = options.getters || [];
    for (var i = 0, len = getters.length; i < len; i++) {
      (function(name) {
        myPrototype[camelCase('get_' + name, '_')] = function() {
          return this[privateKey][name];
        };
      })(getters[i]);
    }

    // Add setters.
    var setters = options.setters || [];
    for (var i = 0, len = setters.length; i < len; i++) {
      (function(name) {
        myPrototype[camelCase('set_' + name, '_')] = function(newValue) {
          var privateData = this[privateKey];
          var oldValue = privateData[name];
          privateData[name] = newValue;
          return oldValue;
        };
      })(setters[i]);
    }

    // Give all prototypal functions access to private data.
    for (var key in myPrototype) {
      (function(key, fn) {
        realPrototype[key] = function() {
          var ret, _ = this[privateKey];
          _();
          this[privateKey] = outerPrivateData;
          try {
            ret = fn.apply(this, arguments);
          }
          catch(e) {
            throw e;
          }
          finally {
            this[privateKey] = _;
          }
          return ret;
        }
      })(key, myPrototype[key]);
    }

    return realConstructor;
  }
})({}, this);