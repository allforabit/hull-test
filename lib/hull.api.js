(function() {
  var __slice = [].slice;

  define(['underscore', 'lib/utils/promises', 'lib/utils/emitter', 'lib/api/api', 'lib/api/reporting', 'lib/utils/entity', 'lib/utils/config', 'lib/api/current-user'], function(_, promises, emitter, api, reporting, entity, configParser, currentUser) {
    var create, failure;
    create = function(config) {
      var _emitter;
      _emitter = emitter();
      return api.init(config, _emitter).then(function(api) {
        var created, noCurentUserDeferred, _reporting;
        _reporting = reporting.init(api);
        _emitter.on('hull.auth.login', function(me) {
          var providers;
          providers = _.pluck(me.identities, 'provider');
          return _reporting.track('hull.auth.login', {
            providers: providers
          });
        });
        _emitter.on('hull.auth.logout', function() {
          return _reporting.track('hull.auth.logout');
        });
        noCurentUserDeferred = promises.deferred();
        noCurentUserDeferred.promise.fail(function() {});
        noCurentUserDeferred.reject({
          reason: 'no_current_user',
          message: 'User must be logged in to perform this action'
        });
        config.services = api.remoteConfig.settings;
        created = {
          config: configParser(config, _emitter),
          on: _emitter.on,
          off: _emitter.off,
          emit: _emitter.emit,
          track: _reporting.track,
          flag: _reporting.flag,
          api: api.api,
          currentUser: currentUser(_emitter),
          signup: function() {
            var args, signupPromise, _ref;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            signupPromise = (_ref = api.auth).signup.apply(_ref, args);
            return signupPromise;
          },
          login: function() {
            var args, _ref;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (api.auth.isAuthenticating()) {
              return console.info("Authentication is in progress. Use `Hull.on('hull.auth.login', fn)` to call `fn` when done.");
            }
            return (_ref = api.auth).login.apply(_ref, args);
          },
          logout: api.auth.logout,
          linkIdentity: function(provider, options, callback) {
            if (options == null) {
              options = {};
            }
            if (!created.currentUser()) {
              return noCurentUserDeferred.promise;
            }
            options.mode = 'connect';
            return created.login(provider, options, callback);
          },
          unlinkIdentity: function(provider, callback) {
            var promise;
            if (!created.currentUser()) {
              return noCurentUserDeferred.promise;
            }
            promise = api.api("me/identities/" + provider, 'delete').then(api.api.bind(api, 'me'));
            promise.then(function(user) {
              _emitter.emit('hull.auth.login', user);
              return callback(user);
            });
            return promise;
          },
          util: {
            entity: entity,
            eventEmitter: _emitter
          }
        };
        created.api.create = create;
        return {
          raw: api,
          api: created,
          eventEmitter: _emitter
        };
      });
    };
    failure = function(error) {
      console.error('Unable to start Hull.api', error.message);
      throw error;
    };
    return {
      init: function(config) {
        return create(config);
      },
      success: function(successResult) {
        return {
          exports: successResult.api,
          context: {
            me: successResult.raw.remoteConfig.data.me,
            app: successResult.raw.remoteConfig.data.app,
            org: successResult.raw.remoteConfig.data.org
          }
        };
      },
      failure: failure
    };
  });

}).call(this);
