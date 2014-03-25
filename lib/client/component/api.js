(function() {
  var __slice = [].slice;

  define(['underscore', 'lib/utils/promises'], function(_, promises) {
    var clearModelsCache, models, module, rawFetch, slice;
    slice = Array.prototype.slice;
    models = {};
    clearModelsCache = function() {
      return models = _.pick(models, 'me', 'app', 'org');
    };
    rawFetch = null;
    module = {
      initialize: function(app) {
        var BaseHullModel, Collection, Model, RawModel, attrs, authScope, core, data, generateModel, hullApi, m, methodMap, remoteConfig, sandbox, setupCollection, setupModel, sync, _i, _len, _ref, _ref1, _results, _track;
        core = app.core;
        sandbox = app.sandbox;
        hullApi = core.data.hullApi;
        _track = function(res, headers) {
          var authScope, error, eventName, hullTrack, trackParams, _ref;
          if (headers == null) {
            headers = {};
          }
          if (headers != null) {
            hullTrack = headers['Hull-Track'];
            if (hullTrack) {
              try {
                _ref = JSON.parse(atob(hullTrack)), eventName = _ref[0], trackParams = _ref[1];
                core.mediator.emit(eventName, trackParams);
              } catch (_error) {
                error = _error;
                console.warn('Error', error);
              }
            }
            if (headers['Hull-Auth-Scope']) {
              return authScope = headers['Hull-Auth-Scope'].split(':')[0];
            }
          }
        };
        core.data.api = function() {
          var args, dfd;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          dfd = hullApi.api.apply(hullApi, args);
          dfd.then(_track);
          return dfd;
        };
        _.each(['get', 'put', 'post', 'delete'], function(method) {
          return core.data.api[method] = function() {
            var args, dfd, _ref;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            dfd = (_ref = hullApi.api)[method].apply(_ref, args);
            dfd.then(_track);
            return dfd;
          };
        });
        methodMap = {
          'create': 'post',
          'update': 'put',
          'delete': 'delete',
          'read': 'get'
        };
        sync = function(method, model, options) {
          var data, dfd, url, verb;
          if (options == null) {
            options = {};
          }
          url = _.isFunction(model.url) ? model.url() : model.url;
          verb = methodMap[method];
          data = options.data;
          if ((data == null) && model && (method === 'create' || method === 'update' || method === 'patch')) {
            data = options.attrs || model.toJSON(options);
          }
          dfd = core.data.api(url, verb, data);
          dfd.then(options.success);
          dfd.then(function(resolved) {
            return model.trigger('sync', model, resolved, options);
          });
          dfd.fail(options.error);
          dfd.fail(function(rejected) {
            return model.trigger('error', model, rejected, options);
          });
          return dfd;
        };
        BaseHullModel = core.mvc.Model.extend({
          sync: sync
        });
        RawModel = BaseHullModel.extend({
          url: function() {
            return this._id || this.id;
          }
        });
        Model = BaseHullModel.extend({
          url: function() {
            var url, _ref;
            if (this.id || this._id) {
              url = this._id || this.id;
            } else {
              url = (_ref = this.collection) != null ? _ref.url : void 0;
            }
            return url;
          }
        });
        Collection = core.mvc.Collection.extend({
          model: Model,
          sync: sync
        });
        setupModel = function(attrs, raw) {
          var model;
          model = generateModel(attrs, raw);
          model.on('change', function() {
            var args, eventName, _ref;
            args = slice.call(arguments);
            eventName = "model.hull." + model._id + '.' + 'change';
            return core.mediator.emit(eventName, {
              eventName: eventName,
              model: model,
              changes: (_ref = args[1]) != null ? _ref.changes : void 0
            });
          });
          model._id = attrs._id;
          models[attrs._id] = model;
          return model;
        };
        core.data.api.model = function(attrs) {
          return rawFetch(attrs, false);
        };
        rawFetch = function(attrs, raw) {
          if (raw == null) {
            raw = false;
          }
          if (_.isString(attrs)) {
            attrs = {
              _id: attrs
            };
          }
          if (!attrs._id) {
            attrs._id = attrs.path;
          }
          if ((attrs != null ? attrs._id : void 0) == null) {
            throw new Error('A model must have an identifier...');
          }
          return models[attrs._id] || setupModel(attrs, raw);
        };
        generateModel = function(attrs, raw) {
          var model, _Model;
          _Model = raw ? RawModel : Model;
          if (attrs.id || attrs._id) {
            return model = new _Model(attrs);
          } else {
            return model = new _Model();
          }
        };
        setupCollection = function(path) {
          var collection, dfd, route;
          route = (core.data.api.parseRoute([path]))[0];
          collection = new Collection;
          collection.url = path;
          collection.on('all', function() {
            var args, eventName, _ref;
            args = slice.call(arguments);
            eventName = "collection." + route.path.replace(/\//g, ".") + '.' + args[0];
            return core.mediator.emit(eventName, {
              eventName: eventName,
              collection: collection,
              changes: (_ref = args[1]) != null ? _ref.changes : void 0
            });
          });
          dfd = collection.deferred = promises.deferred();
          if (collection.models.length > 0) {
            collection._fetched = true;
            dfd.resolve(collection);
          } else {
            collection._fetched = false;
            collection.fetch({
              success: function() {
                collection._fetched = true;
                return dfd.resolve(collection);
              },
              error: function() {
                return dfd.fail(collection);
              }
            });
          }
          return collection;
        };
        core.data.api.collection = function(path) {
          if (path == null) {
            throw new Error('A model must have an path...');
          }
          return setupCollection.call(core.data.api, path);
        };
        sandbox = app.sandbox;
        authScope = hullApi.authScope;
        remoteConfig = hullApi.remoteConfig;
        data = remoteConfig.data;
        app.config.assetsUrl = remoteConfig.assetsUrl;
        app.config.services = remoteConfig.settings;
        app.components.addSource('hull', remoteConfig.baseUrl + '/aura_components');
        if (sandbox.config == null) {
          sandbox.config = {};
        }
        sandbox.config.debug = app.config.debug;
        sandbox.config.assetsUrl = remoteConfig.assetsUrl;
        sandbox.config.appId = app.config.appId;
        sandbox.config.orgUrl = app.config.orgUrl;
        sandbox.config.services = remoteConfig.settings;
        sandbox.config.entity_id = (_ref = data.entity) != null ? _ref.id : void 0;
        sandbox.isAdmin = function() {
          return authScope === 'Account' || sandbox.data.api.model('me').get('is_admin');
        };
        sandbox.login = hullApi.login;
        sandbox.logout = hullApi.logout;
        sandbox.linkIdentity = function(provider, opts, callback) {
          if (opts == null) {
            opts = {};
          }
          if (callback == null) {
            callback = function() {};
          }
          opts.mode = 'connect';
          return sandbox.login(provider, opts, callback);
        };
        sandbox.unlinkIdentity = function(provider, callback) {
          if (callback == null) {
            callback = function() {};
          }
          return core.data.api("me/identities/" + provider, 'delete').then(function() {
            var promise;
            promise = app.sandbox.data.api.model('me').fetch();
            promise.then(function(me) {
              return core.mediator.emit('hull.auth.login', me);
            });
            return promise.then(callback);
          });
        };
        _ref1 = ['me', 'app', 'org', 'entity'];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          m = _ref1[_i];
          attrs = data[m];
          if (attrs) {
            attrs._id = m;
            _results.push(rawFetch(attrs, true));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      afterAppStart: function(app) {
        var core;
        core = app.core;
        return core.mediator.on('hull.auth.*', clearModelsCache);
      }
    };
    return module;
  });

}).call(this);
