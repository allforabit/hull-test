(function() {
  define(function() {
    var _normalizeComponentName;
    _normalizeComponentName = function(name) {
      var source, _ref;
      _ref = name.split('@'), name = _ref[0], source = _ref[1];
      if (source == null) {
        source = 'default';
      }
      return "__component__$" + name + "@" + source;
    };
    return function(_define) {
      return function(componentName, componentDef) {
        if (!componentDef) {
          componentDef = componentName;
          componentName = null;
        }
        if (componentName && !Object.prototype.toString.apply(componentName) === '[object String]') {
          throw 'The component identifier must be a String';
        }
        if (Object.prototype.toString.apply(componentDef) === '[object Function]') {
          componentDef = componentDef();
        }
        if (Object.prototype.toString.apply(componentDef) !== '[object Object]') {
          throw "A component must have a definition";
        }
        if (componentDef.type == null) {
          componentDef.type = "Hull";
        }
        if (componentName) {
          _define(_normalizeComponentName(componentName), componentDef);
        } else {
          _define(['module'], function(module) {
            _define(module.id, componentDef);
            return componentDef;
          });
        }
        return componentDef;
      };
    };
  });

}).call(this);
