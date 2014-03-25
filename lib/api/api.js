(function() {
  define(['underscore', '../utils/cookies', '../utils/version', '../api/params', '../api/auth', '../utils/promises', 'lib/api/xdm'], function(_, cookie, version, apiParams, authModule, promises, xdm) {
    var slice;
    slice = Array.prototype.slice;
    return {
      init: function(config, emitter) {
        var api, dfd, message, onRemoteReady, rpc, setCurrentUser;
        if (config == null) {
          config = {};
        }
        dfd = promises.deferred();
        if (!(config.orgUrl && config.appId)) {
          if (!config.orgUrl) {
            dfd.reject(new ReferenceError('no organizationURL provided. Can\'t proceed'));
          }
          if (!config.appId) {
            dfd.reject(new ReferenceError('no applicationID provided. Can\'t proceed'));
          }
          return dfd.promise;
        }
        message = null;
        api = function() {
          return message.apply(void 0, apiParams.parse(slice.call(arguments)));
        };
        _.each(['get', 'post', 'put', 'delete'], function(method) {
          return api[method] = function() {
            var args, req;
            args = apiParams.parse(slice.call(arguments));
            req = args[0];
            req.method = method;
            return message.apply(api, args);
          };
        });
        api.parseRoute = apiParams.parse;
        setCurrentUser = function(headers) {
          var cookieName, val;
          if (headers == null) {
            headers = {};
          }
          if (!config.appId) {
            return;
          }
          cookieName = "hull_" + config.appId;
          if (headers && headers['Hull-User-Id'] && headers['Hull-User-Sig']) {
            val = btoa(JSON.stringify(headers));
            return cookie.set(cookieName, val, {
              path: "/"
            });
          } else {
            return cookie.remove(cookieName, {
              path: "/"
            });
          }
        };
        rpc = null;
        onRemoteReady = function(remoteObj) {
          var authScope, data, remoteConfig, _ref;
          rpc = remoteObj.rpc;
          remoteConfig = remoteObj.config;
          data = remoteConfig.data;
          setCurrentUser(data.headers);
          if ((_ref = data.headers) != null ? _ref['Hull-Auth-Scope'] : void 0) {
            authScope = data.headers['Hull-Auth-Scope'].split(":")[0];
          }
          return {
            auth: authModule(api, config, emitter, _.keys(remoteConfig.settings.auth || {})),
            remoteConfig: remoteConfig,
            authScope: authScope || '',
            api: api,
            init: function() {
              return dfd.promise;
            }
          };
        };
        xdm(config, emitter).then(onRemoteReady).then(dfd.resolve, dfd.reject);

        /*
         * Sends the message described by @params to xdm
         * @param {Object} contains the provider, uri and parameters for the message
         * @param {Function} optional a success callback
         * @param {Function} optional an error callback
         * @return {Promise}
         */
        message = function(params, callback, errback) {
          var deferred, onError, onSuccess;
          if (!rpc) {
            console.error("Api not initialized yet");
          }
          deferred = promises.deferred();
          onSuccess = function(res) {
            var error, eventName, headers, hullTrack, trackParams, _ref;
            if (res == null) {
              res = {};
            }
            if (res.provider === 'hull') {
              setCurrentUser(res.headers);
            }
            headers = res != null ? res.headers : void 0;
            if ((headers != null) && res.provider === 'hull') {
              hullTrack = headers['Hull-Track'];
              if (hullTrack) {
                try {
                  _ref = JSON.parse(atob(hullTrack)), eventName = _ref[0], trackParams = _ref[1];
                  emitter.emit(eventName, trackParams);
                } catch (_error) {
                  error = _error;
                  false;
                }
              }
            }
            callback(res.response);
            return deferred.resolve(res.response, res.headers);
          };
          onError = function(err) {
            if (err == null) {
              err = {};
            }
            errback(err.message);
            return deferred.reject(err.message);
          };
          rpc.message(params, onSuccess, onError);
          return deferred.promise;
        };
        return dfd.promise;
      }
    };
  });

}).call(this);
