(function() {
  define(['jquery-jsonp'], function(jsonp) {
    return {
      initialize: function(app) {
        return app.core.routeHandlers.angellist = function(req, callback, errback) {
          var path, req_data, request, _ref;
          path = req.path;
          if (path[0] === "/") {
            path = path.substring(1);
          }
          req_data = req.params;
          if (req.method.toLowerCase() !== 'get') {
            return failure('Can only handle GET requests');
          }
          req_data.access_token = (_ref = app.core.settings().auth.angellist) != null ? _ref.token : void 0;
          request = jsonp({
            url: "https://api.angel.co/1/" + path,
            data: req_data,
            callbackParameter: 'callback'
          });
          request.then(function(response) {
            return callback({
              response: response,
              provider: 'angellist'
            });
          }, function(err) {
            return errback(er.url);
          });
        };
      }
    };
  });

}).call(this);
