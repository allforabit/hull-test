(function() {
  define(['underscore', 'xdm'], function(_, xdm) {
    var catchAll;
    catchAll = function(res) {
      console.warn("CatchAll Handler: ", res);
      return res;
    };
    return function(app) {
      var rpc;
      rpc = null;
      return {
        initialize: function(app) {
          var core, e, onRemoteMessage, rpcFall;
          core = app.core;
          core.routeHandlers = {};
          onRemoteMessage = function(req, callback, errback) {
            var handler, namespace, provider, __, _ref;
            if (!req.path) {
              throw new Error("Path not recognized " + (JSON.stringify(req)));
            }
            handler = core.routeHandlers[req.provider];
            if (_.isFunction(handler)) {
              return handler(req, callback, errback);
            } else {
              _ref = req.provider.match(/^(admin)\@([a-z0-9_\-]+)$/i), __ = _ref[0], provider = _ref[1], namespace = _ref[2];
              if (provider && namespace) {
                req.provider = provider;
                req.namespace = namespace;
                handler = core.routeHandlers['admin'];
                return handler(req, callback, errback);
              } else {
                return errback(catchAll(req));
              }
            }
          };
          try {
            rpc = new xdm.Rpc({
              acl: app.config.appDomains
            }, {
              remote: {
                message: {},
                ready: {},
                userUpdate: {},
                settingsUpdate: {}
              },
              local: {
                message: onRemoteMessage
              }
            });
          } catch (_error) {
            e = _error;
            rpcFall = new xdm.Rpc({}, {
              remote: {
                message: {}
              }
            });
            rpcFall.message({
              error: "" + e.message + ", please make sure this domain is whitelisted for this app."
            });
          }
          return true;
        },
        afterAppStart: function(app) {
          if (!rpc) {
            throw 'Unable to start Hull.';
          }
          rpc.ready(app.config);
          app.sandbox.on('remote.user.update', rpc.userUpdate.bind(rpc));
          return app.sandbox.on('remote.settings.update', rpc.settingsUpdate.bind(rpc));
        }
      };
    };
  });

}).call(this);
