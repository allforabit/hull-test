(function() {
  define(['underscore'], function(_) {
    var configParser, dirtyClone;
    dirtyClone = function(obj) {
      if (obj !== void 0) {
        return JSON.parse(JSON.stringify(obj));
      }
    };
    configParser = function(config, emitter) {
      if (emitter) {
        emitter.on('hull.settings.update', function(settings) {
          return config.services = settings;
        });
      }
      return function(key) {
        var _cursor;
        _cursor = config;
        if (!key) {
          return dirtyClone(config);
        }
        _.each(key.split('.'), function(k) {
          if (_cursor === void 0) {
            return _cursor;
          }
          if (_.contains(_.keys(_cursor), k)) {
            return _cursor = _cursor[k];
          } else {
            return _cursor = void 0;
          }
        });
        return dirtyClone(_cursor);
      };
    };
    return function(config, emitter) {
      return configParser(config, emitter);
    };
  });

}).call(this);
