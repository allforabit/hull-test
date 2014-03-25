(function() {
  if (!window.jQuery) {
    throw 'jQuery must be available for components to work';
  }

  define(['underscore', 'lib/utils/promises', 'aura/aura', 'lib/utils/handlebars', 'lib/hull.api', 'lib/utils/emitter', 'lib/client/component/registrar', 'lib/helpers/login'], function(_, promises, Aura, Handlebars, HullAPI, emitterInstance, componentRegistrar, loginHelpers) {
    var hullApiMiddleware, setupApp;
    hullApiMiddleware = function(api) {
      return {
        name: 'Hull',
        initialize: function(app) {
          app.core.mediator.setMaxListeners(100);
          return app.core.data.hullApi = api;
        },
        afterAppStart: function(app) {
          var sb;
          _ = app.core.util._;
          return sb = app.sandboxes.create();
        }
      };
    };
    setupApp = function(app, api) {
      return app.use(hullApiMiddleware(api)).use('aura-extensions/aura-base64').use('aura-extensions/aura-cookies').use('aura-extensions/aura-backbone').use('aura-extensions/aura-moment').use('aura-extensions/aura-twitter-text').use('aura-extensions/hull-reporting').use('aura-extensions/hull-entities').use('aura-extensions/hull-utils').use('aura-extensions/aura-form-serialize').use('aura-extensions/aura-component-validate-options').use('aura-extensions/aura-component-require').use('aura-extensions/hull-component-normalize-id').use('aura-extensions/hull-component-reporting').use('lib/client/component/api').use('lib/client/component/actions').use('lib/client/component/component').use('lib/client/component/templates').use('lib/client/component/datasource');
    };
    return {
      init: function(config) {
        var appPromise;
        appPromise = HullAPI.init(config);
        if (config.apiOnly === true) {
          return appPromise;
        }
        return appPromise.then(function(successResult) {
          var app, deps;
          app = new Aura(_.extend(config, {
            mediatorInstance: successResult.eventEmitter
          }));
          deps = {
            api: successResult.raw.api,
            authScope: successResult.raw.authScope,
            remoteConfig: successResult.raw.remoteConfig,
            login: successResult.api.login,
            logout: successResult.api.logout
          };
          return {
            app: setupApp(app, deps),
            api: successResult,
            components: true
          };
        });
      },
      success: function(appParts) {
        var apiParts, booted;
        apiParts = HullAPI.success(appParts.api);
        booted = apiParts.exports;
        if (!appParts.components) {
          return booted;
        }
        booted.component = componentRegistrar(define);
        booted.util.Handlebars = Handlebars;
        booted.define = define;
        booted.parse = function(el, options) {
          if (options == null) {
            options = {};
          }
          return appParts.app.core.appSandbox.start(el, options);
        };
        appParts.app.start({
          components: 'body'
        }).then(function() {
          booted.on('hull.auth.login', _.bind(loginHelpers.login, void 0, appParts.app.sandbox.data.api.model, appParts.app.core.mediator));
          return booted.on('hull.auth.logout', _.bind(loginHelpers.logout, void 0, appParts.app.sandbox.data.api.model, appParts.app.core.mediator));
        }, function(e) {
          console.error('Unable to start Aura app:', e);
          return appParts.app.stop();
        });
        return {
          exports: booted,
          context: apiParts.context
        };
      },
      failure: function(error) {
        console.error(error.message || error);
        return error;
      }
    };
  });

}).call(this);
