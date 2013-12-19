/**
 * Setup inheritance.
 * @param {!Function} baseClass  The base class from which the subclass
 *     inherits its prototypal values.
 * @param {!Function} subClass  Class which inherits from the base class.
 * @return {!Function}  The updated subclass.
 */
var inherit = (function(fakeClass, hasOwnProperty) {
  return function(baseClass, subClass, prototypes) {
    fakeClass.prototype = baseClass.prototype;
    var prototype = subClass.prototype = new fakeClass();
    prototype.superClass = baseClass;
    return prototype.constructor = subClass;
  };
})(function(){}, {}.hasOwnProperty);