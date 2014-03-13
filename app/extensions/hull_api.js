/*
 * Wrap hull
 */

define({
  require: {
    paths: {
      hullApi: 'lib/hull.api'
    }
  },
  initialize: function(app) {
    var appPromise,
        hullApi = require('hullApi');

    appPromise = hullApi.init(app.config);

    app.core.mediator.setMaxListeners(100);

    appPromise.then(function(successResult){

      app.core.data.hullApi = {
        api: successResult.raw.api,
        authScope: successResult.raw.authScope,
        remoteConfig: successResult.raw.remoteConfig,
        login: successResult.api.login,
        logout: successResult.api.logout
      };

      app.on('hull.auth.login', _.bind(app.core.data.hullApi, void 0, appParts.app.sandbox.data.api.model, appParts.app.core.mediator));
      app.on('hull.auth.logout', _.bind(loginHelpers.logout, void 0, appParts.app.sandbox.data.api.model, appParts.app.core.mediator));

    });

    return appPromise;

  }

});

