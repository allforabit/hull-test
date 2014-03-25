(function() {
  define(['lib/remote/services/proxy'], function(proxy) {
    return {
      initialize: function(app) {
        return app.core.routeHandlers.soundcloud = proxy({
          name: 'soundcloud',
          path: 'soundcloud'
        }, app.core.handler);
      }
    };
  });

}).call(this);
