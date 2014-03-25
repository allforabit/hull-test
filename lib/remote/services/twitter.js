(function() {
  define(['lib/remote/services/proxy'], function(proxy) {
    return {
      initialize: function(app) {
        return app.core.routeHandlers.twitter = proxy({
          name: 'twitter',
          path: 'twitter/1.1'
        }, app.core.handler);
      }
    };
  });

}).call(this);
