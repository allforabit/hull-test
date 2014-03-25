(function() {
  define(['underscore'], function(_) {
    var ConfigNormalizer, flattenSettings;
    flattenSettings = function(settings, name) {
      return [name.replace(/_app$/, ''), settings[name] || {}];
    };
    return ConfigNormalizer = (function() {
      function ConfigNormalizer(cfg) {
        this.config = cfg;
      }

      ConfigNormalizer.prototype.sortServicesByType = function(settings, types) {
        var ret;
        ret = _.map(types, function(names, type) {
          var typeSettings;
          typeSettings = _.object(_.map(names, _.bind(flattenSettings, void 0, settings)));
          return [type, typeSettings];
        });
        return _.object(ret);
      };

      ConfigNormalizer.prototype.applyUserCredentials = function(config, creds) {
        if (creds == null) {
          creds = {};
        }
        return _.each(creds, function(c, k) {
          if (!_.keys(c).length) {
            return;
          }
          if (config != null) {
            if (config[k] == null) {
              config[k] = {};
            }
          }
          return config != null ? config[k].credentials = c : void 0;
        });
      };

      ConfigNormalizer.prototype.normalize = function() {
        var _base;
        this.config.settings = this.sortServicesByType(this.config.services.settings, this.config.services.types);
        if ((_base = this.config.settings).auth == null) {
          _base.auth = {};
        }
        this.applyUserCredentials(this.config.settings.auth, this.config.data.credentials);
        return this.config;
      };

      return ConfigNormalizer;

    })();
  });

}).call(this);
