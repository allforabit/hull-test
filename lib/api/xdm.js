(function() {
  define(['domready', 'lib/utils/promises', 'xdm', 'lib/utils/version'], function(domready, promises, xdm, version) {
    var buildRemoteUrl;
    buildRemoteUrl = function(config) {
      var remoteUrl;
      remoteUrl = "" + config.orgUrl + "/api/v1/" + config.appId + "/remote.html?v=" + version;
      if (config.jsUrl) {
        remoteUrl += "&js=" + config.jsUrl;
      }
      if (config.uid) {
        remoteUrl += "&uid=" + config.uid;
      }
      if (config.appSecret) {
        remoteUrl += "&access_token=" + config.appSecret;
      }
      if (config.userHash !== void 0) {
        remoteUrl += "&user_hash=" + config.userHash;
      }
      remoteUrl += "&r=" + (encodeURIComponent(document.referrer));
      return remoteUrl;
    };
    return function(config, emitter) {
      var deferred, onMessage, readyFn, rpc, settingsUpdate, timeout, userUpdate;
      timeout = null;
      rpc = null;
      deferred = promises.deferred();
      onMessage = function(e) {
        console.log('remoteMessage', e);
        if (e.error) {
          return deferred.reject(e.error);
        } else {
          return console.warn("RPC Message", arguments);
        }
      };
      settingsUpdate = function(currentSettings) {
        return emitter.emit('hull.settings.update', currentSettings);
      };
      userUpdate = function(currentUser) {};
      readyFn = function(remoteConfig) {
        window.clearTimeout(timeout);
        return deferred.resolve({
          rpc: rpc,
          config: remoteConfig
        });
      };
      domready(function() {
        timeout = setTimeout(function() {
          return deferred.reject('Remote loading has failed. Please check "orgUrl" and "appId" in your configuration. This may also be about connectivity.');
        }, 30000);
        return rpc = new xdm.Rpc({
          remote: buildRemoteUrl(config),
          container: document.body,
          props: {
            tabIndex: -1,
            height: "0",
            width: "1px",
            style: {
              position: 'fixed',
              width: "0",
              top: '-20px',
              left: '-20px'
            }
          }
        }, {
          remote: {
            message: {},
            ready: {}
          },
          local: {
            message: onMessage,
            ready: readyFn,
            userUpdate: userUpdate,
            settingsUpdate: settingsUpdate
          }
        });
      });
      return deferred.promise;
    };
  });

}).call(this);
