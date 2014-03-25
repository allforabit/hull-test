(function() {
  define(['jquery-jsonp', 'underscore'], function(jsonp, _) {
    return {
      initialize: function(app) {
        return app.core.routeHandlers.linkedin = function(req, success, failure) {
          var method, request, token, _ref, _ref1, _ref2;
          method = req.method.toLowerCase();
          token = (_ref = app.core.settings().auth) != null ? (_ref1 = _ref.linkedin) != null ? (_ref2 = _ref1.credentials) != null ? _ref2.token : void 0 : void 0 : void 0;
          if (!token) {
            return failure('No linkedIn user');
          }
          if (method !== 'get') {
            return failure('Unable to perform non-GET requests on LinkedIn');
          }
          request = jsonp({
            url: "https://api.linkedin.com/v1/" + req.path,
            callbackParameter: "callback",
            data: _.extend({}, req.params, {
              oauth2_access_token: token
            })
          });
          request.done(function(response) {
            return success({
              response: response,
              provider: 'linkedin'
            });
          });
          request.fail(function(req) {
            return failure(req.url);
          });
        };
      }
    };
  });

}).call(this);
