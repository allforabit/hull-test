(function() {
  define(['aura/aura', 'underscore', 'lib/utils/version', 'lib/remote/config-normalizer'], function(Aura, _, version, ConfigNormalizer) {
    var Hull, availableServices, hull, isAvailable;
    availableServices = ['angellist', 'facebook', 'github', 'instagram', 'linkedin', 'soundcloud', 'tumblr', 'twitter'];
    isAvailable = _.bind(_.contains, _, availableServices);
    hull = null;
    Hull = function(config) {
      var auth_services, keys, normalizer, _ref;
      normalizer = new ConfigNormalizer(config);
      config = normalizer.normalize();
      if (hull && hull.app) {
        return hull;
      }
      hull = {
        config: config
      };
      if (config.debug == null) {
        config.debug = false;
      }
      config.components = false;
      hull.app = Aura(config);
      hull.app.use('aura-extensions/aura-cookies');
      hull.app.use('aura-extensions/aura-purl');
      hull.app.use('aura-extensions/aura-uuid');
      hull.app.use('lib/remote/services');
      hull.app.use('lib/remote/handler');
      hull.app.use('lib/remote/current-user');
      hull.app.use('lib/remote/services/hull');
      hull.app.use('lib/remote/services/admin');
      keys = _.keys(((_ref = config.settings) != null ? _ref.auth : void 0) || []);
      auth_services = _.filter(keys, isAvailable);
      _.each(auth_services, function(value) {
        return hull.app.use("lib/remote/services/" + value);
      });
      hull.app.start();
      return hull;
    };
    window.Hull = Hull;
    Hull.version = version;
    return Hull;
  });

}).call(this);
