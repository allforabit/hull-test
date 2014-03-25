(function() {
  define(['jquery', 'underscore', '../handler'], function($, _, Handler) {
    return function(app) {
      var createOrRefreshUuid, doTrack, getBrowserId, getSessionId, handler, hullHandler, identify, initInfo, trackAction, trackHandler, _ref;
      createOrRefreshUuid = function(key, expires) {
        var uuid;
        uuid = app.core.cookies.get(key) || app.core.util.uuid();
        app.core.cookies.set(key, uuid, {
          domain: document.location.host,
          expires: expires
        });
        return uuid;
      };
      getBrowserId = function() {
        var year;
        year = new Date().getFullYear() + 10;
        return createOrRefreshUuid('_bid', new Date(year, 0, 1));
      };
      getSessionId = function() {
        return createOrRefreshUuid('_sid', 30 * 60);
      };
      initInfo = {
        url: app.config.data.request.url.href,
        path: app.config.data.request.url.path,
        referrer: (_ref = app.config.data.request.referrer) != null ? _ref.href : void 0,
        browser_id: getBrowserId(),
        session_id: getSessionId()
      };
      identify = function(me) {
        var analytics, ident, identified, signInCount, _ref1;
        if (!me) {
          return;
        }
        identified = !(me.id == null);
        if (!identified) {
          return;
        }
        analytics = require('analytics');
        signInCount = ((_ref1 = me.stats) != null ? _ref1.sign_in_count : void 0) || 0;
        if (identified && signInCount === 1) {
          analytics.alias(me.id);
        }
        ident = _.pick(me, 'name', 'email', 'id', 'picture');
        ident.created = me.created_at;
        ident.distinct_id = me.id;
        return analytics.identify(me.id, ident);
      };
      handler = app.core.handler;
      hullHandler = function(options, success, error) {
        var promise;
        promise = handler.handle({
          url: options.path,
          type: options.method,
          data: options.params
        });
        promise.then(function(h) {
          if (h.request.url === '/api/v1/me') {
            identify(h.response);
          }
          h.provider = 'hull';
          if (_.isFunction(success)) {
            return success(h);
          }
        }, function(h) {
          return error(h.response);
        });
      };
      doTrack = function(event, params) {
        var _ref1, _ref2, _ref3, _ref4;
        if (params == null) {
          params = {};
        }
        if (!event) {
          return;
        }
        params.hull_app_id = (_ref1 = app.config) != null ? _ref1.appId : void 0;
        params.hull_app_name = (_ref2 = app.config) != null ? (_ref3 = _ref2.data) != null ? (_ref4 = _ref3.app) != null ? _ref4.name : void 0 : void 0 : void 0;
        _.defaults(params, initInfo);
        return require('analytics').track(event, params);
      };
      trackAction = function(response) {
        var error, eventName, track, trackParams, _ref1;
        if (!(track = response.headers['Hull-Track'])) {
          return;
        }
        try {
          _ref1 = JSON.parse(atob(track)), eventName = _ref1[0], trackParams = _ref1[1];
          return doTrack(eventName, trackParams);
        } catch (_error) {
          error = _error;
          console.warn('Invalid Tracking header');
          return "Invalid Tracking header";
        }
      };
      handler.after(trackAction);
      trackHandler = function(req, callback, errback) {
        var eventName, promise, _base;
        eventName = req.path;
        doTrack(eventName, req.params);
        if ((_base = req.params).event == null) {
          _base.event = eventName;
        }
        req.params = {
          t: btoa(JSON.stringify(req.params))
        };
        promise = handler.handle({
          url: 't',
          type: req.method || 'post',
          data: req.params
        });
        promise.then(function(h) {
          h.provider = 't';
          return callback(h);
        }, function(err) {
          return errback(err.response);
        });
      };
      return {
        require: {
          paths: {
            analytics: 'components/analytics/analytics',
            base64: 'components/base64/base64'
          }
        },
        initialize: function(app) {
          var analytics, analyticsSettings, settings;
          analytics = require('analytics');
          settings = app.config.settings.analytics || {};
          analyticsSettings = {};
          _.each(settings, function(s) {
            return analyticsSettings[s.name] = s;
          });
          analytics.initialize(analyticsSettings);
          if (app.config.data.me != null) {
            identify(app.config.data.me);
          }
          doTrack("hull.app.init");
          app.core.routeHandlers.hull = hullHandler;
          return app.core.routeHandlers.track = trackHandler;
        }
      };
    };
  });

}).call(this);
