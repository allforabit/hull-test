(function() {
  var hash;

  try {
    hash = JSON.parse(atob(document.location.hash.replace('#', '')));
    if (window.opener && window.opener.Hull && window.opener.__hull_login_status__ && (hash != null)) {
      window.opener.__hull_login_status__(hash);
      window.close();
    }
  } catch (_error) {}

  define(['underscore', '../utils/promises', '../utils/version'], function(_, promises, version) {
    return function(apiFn, config, emitter, authServices) {
      var authModule, authenticating, generateAuthUrl, login, loginWithProvider, logout, module, onCompleteAuthentication, signup, _popupInterval;
      if (authServices == null) {
        authServices = [];
      }
      authenticating = null;
      _popupInterval = null;
      signup = function(user) {
        return apiFn('users', 'post', user).then(function(me) {
          emitter.emit('hull.auth.login', me);
          return me;
        }, function(err) {
          emitter.emit('hull.auth.fail', err.message);
          throw err;
        });
      };
      login = function(loginOrProvider, optionsOrPassword, callback) {
        var evtPromise, promise;
        if (!_.isString(loginOrProvider)) {
          throw new TypeError("'loginOrProvider' must be a String");
        }
        if (_.isString(optionsOrPassword)) {
          promise = apiFn('users/login', 'post', {
            login: loginOrProvider,
            password: optionsOrPassword
          });
        } else {
          promise = loginWithProvider(loginOrProvider, optionsOrPassword).then(function() {
            return apiFn('me');
          });
        }
        evtPromise = promise.then(function(me) {
          emitter.emit('hull.auth.login', me);
          return me;
        }, function(err) {
          emitter.emit('hull.auth.fail', err);
          return err;
        });
        if (_.isFunction(callback)) {
          evtPromise.then(callback);
        }
        return promise;
      };
      loginWithProvider = function(providerName, opts) {
        var authUrl;
        if (module.isAuthenticating()) {
          return module.isAuthenticating();
        }
        providerName = providerName.toLowerCase();
        authenticating = promises.deferred();
        if (!~(_.indexOf(authServices, providerName))) {
          authenticating.reject({
            message: "No authentication service " + providerName + " configured for the app",
            reason: 'no_such_service'
          });
          return authenticating.promise;
        }
        authenticating.providerName = providerName;
        authUrl = module.authUrl(config, providerName, opts);
        module.authHelper(authUrl);
        return authenticating.promise;
      };
      logout = function(callback) {
        var promise;
        promise = apiFn('logout');
        promise.done(function() {
          if (_.isFunction(callback)) {
            return callback();
          }
        });
        return promise.then(function() {
          return emitter.emit('hull.auth.logout');
        });
      };
      onCompleteAuthentication = function(hash) {
        var error, _auth;
        _auth = authenticating;
        if (!authenticating) {
          return;
        }
        if (hash.success) {
          authenticating.resolve({});
        } else {
          error = new Error('Login failed');
          error.reason = hash.error.reason;
          authenticating.reject(error);
        }
        authenticating = null;
        clearInterval(_popupInterval);
        _popupInterval = null;
        return _auth;
      };
      generateAuthUrl = function(config, provider, opts) {
        var auth_params, querystring;
        module.createCallback();
        auth_params = opts || {};
        auth_params.app_id = config.appId;
        auth_params.callback_url = config.callback_url || config.callbackUrl || module.location.toString();
        auth_params.auth_referer = module.location.toString();
        auth_params.version = version;
        querystring = _.map(auth_params, function(v, k) {
          return encodeURIComponent(k) + '=' + encodeURIComponent(v);
        }).join('&');
        return "" + config.orgUrl + "/auth/" + provider + "?" + querystring;
      };
      module = {
        isAuthenticating: function() {
          return authenticating != null;
        },
        location: document.location,
        authUrl: generateAuthUrl,
        createCallback: function() {
          return window.__hull_login_status__ = function(hash) {
            window.__hull_login_status__ = null;
            return onCompleteAuthentication(hash);
          };
        },
        authHelper: function(path) {
          var w, _ref;
          w = window.open(path, "_auth", 'location=0,status=0,width=990,height=600');
          if ((_ref = window.device) != null ? _ref.cordova : void 0) {
            if (w != null) {
              w.addEventListener('loadstart', function(event) {
                hash = (function() {
                  try {
                    return JSON.parse(atob(event.url.split('#')[1]));
                  } catch (_error) {}
                })();
                if (hash) {
                  window.__hull_login_status__(hash);
                  return w.close();
                }
              });
            }
          }
          return _popupInterval = (w != null) && setInterval(function() {
            if (w != null ? w.closed : void 0) {
              return onCompleteAuthentication({
                success: false,
                error: {
                  reason: 'window_closed'
                }
              });
            }
          }, 200);
        },
        onCompleteAuth: onCompleteAuthentication
      };
      authModule = {
        signup: signup,
        login: login,
        logout: logout,
        isAuthenticating: module.isAuthenticating
      };
      return authModule;
    };
  });

}).call(this);
