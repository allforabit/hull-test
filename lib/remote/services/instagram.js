(function() {
  define(['jquery-jsonp', 'lib/remote/services/proxy'], function(jsonp, proxyBuilder) {
    return function(app) {
      var handler, proxy;
      proxy = proxyBuilder({
        name: 'instagram',
        path: 'instagram'
      }, app.core.handler);
      handler = (function(_this) {
        return function(req, callback, errback) {
          var instaConfig, method, path, request, requestParams, _ref;
          method = req.method.toLowerCase();
          path = req.path;
          if (path[0] === "/") {
            path = path.substring(1);
          }
          requestParams = {};
          instaConfig = (_ref = app.core.settings().auth) != null ? _ref.instagram : void 0;
          if (method === 'get') {
            requestParams = {
              url: "https://api.instagram.com/v1/" + path,
              data: _.extend({}, req.params, instaConfig),
              callbackParameter: 'callback'
            };
            request = jsonp(requestParams);
            request.done(function(response) {
              return callback({
                response: response.data,
                provider: 'instagram',
                pagination: response.pagination
              });
            });
            request.fail(function(err) {
              return errback(err.url);
            });
          } else {
            proxy(req, callback, errback);
          }
        };
      })(this);
      return {
        initialize: function(app) {
          return app.core.routeHandlers.instagram = handler;
        }
      };
    };
  });

}).call(this);
