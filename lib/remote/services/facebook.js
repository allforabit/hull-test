(function() {
  define(function() {
    var api, ensureLoggedIn, fql, resp, slice;
    slice = Array.prototype.slice;
    ensureLoggedIn = function(base) {
      return function() {
        var args;
        args = slice.call(arguments);
        return FB.getLoginStatus(function() {
          return base.apply(void 0, args);
        }, true);
      };
    };
    resp = function(req, callback, errback) {
      return function(res) {
        var errorMsg;
        if (res && !res.error) {
          return callback({
            response: res,
            provider: 'facebook'
          });
        } else {
          if (res) {
            errorMsg = "[FB Error] " + res.error.type + " : " + res.error.message;
          } else {
            errorMsg = "[FB Error] Unknown error";
          }
          return errback(errorMsg, {
            result: res,
            request: req
          });
        }
      };
    };
    api = ensureLoggedIn(function(req, callback, errback) {
      var path;
      path = req.path;
      return FB.api(path, req.method, req.params, resp(req, callback, function(msg, res) {
        res.time = new Date();
        return callback(res);
      }));
    });
    fql = ensureLoggedIn(function(req, callback, errback) {
      return FB.api({
        method: 'fql.query',
        query: req.params.query
      }, resp(req, callback, errback));
    });
    return {
      require: {
        paths: {
          facebook: "https://connect.facebook.net/en_US/all"
        },
        shim: {
          facebook: {
            exports: 'FB'
          }
        }
      },
      initialize: function(app) {
        FB.init(app.config.settings.auth.facebook);
        app.core.routeHandlers.fql = fql;
        return app.core.routeHandlers.facebook = api;
      }
    };
  });

}).call(this);
