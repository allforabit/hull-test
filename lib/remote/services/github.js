(function() {
  define(function() {
    return function(app) {
      var api;
      api = function(req, callback, errback) {
        var headers, path, req_data, request, token, url, _ref, _ref1, _ref2;
        path = req.path;
        if (path[0] === "/") {
          path = path.substring(1);
        }
        url = "https://api.github.com/" + path;
        if (req.method.toLowerCase() === 'delete') {
          req_data = JSON.stringify(req.params || {});
        } else {
          req_data = req.params;
        }
        headers = {};
        token = (_ref = app.core.settings().auth) != null ? (_ref1 = _ref.github) != null ? (_ref2 = _ref1.credentials) != null ? _ref2.token : void 0 : void 0 : void 0;
        if (token) {
          headers['Authorization'] = "token " + token;
        }
        request = app.core.data.ajax({
          url: url,
          type: req.method,
          data: req_data,
          headers: headers
        });
        request.then(function(response) {
          return callback({
            response: response,
            provider: 'github'
          });
        }, errback);
      };
      return {
        initialize: function(app) {
          return app.core.routeHandlers.github = api;
        }
      };
    };
  });

}).call(this);
