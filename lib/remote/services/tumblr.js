(function() {
  define(['lib/remote/services/proxy'], function(proxy) {
    return {
      initialize: function(app) {
        return app.core.routeHandlers.tumblr = proxy({
          name: 'tumblr',
          path: 'tumblr/v2'
        }, app.core.handler);
      }
    };
  });

}).call(this);
