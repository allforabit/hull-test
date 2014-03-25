define(['aura/aura'], function(Aura) {
  var init, api, app;

  init = function init(config){

    app = new Aura(config);

    app
      .use('extensions/templates')
      .use('extensions/hull_api')
      .use('extensions/rivets')
      .use('lib/client/component/datasource')
      //.use(hullApiMiddleware(hullApi))
      //.use('extensions/hull')
      .use('aura-extensions/aura-base64')
      .use('aura-extensions/aura-cookies')
      .use('aura-extensions/aura-backbone')
      .use('aura-extensions/aura-moment')
      .use('aura-extensions/aura-twitter-text')
      /*
      .use('aura-extensions/hull-reporting')
      //.use('aura-extensions/hull-entities')
      .use('aura-extensions/hull-utils')
      .use('aura-extensions/aura-form-serialize')
      .use('aura-extensions/aura-component-validate-options')
      .use('aura-extensions/aura-component-require')
      .use('aura-extensions/hull-component-normalize-id')
      .use('aura-extensions/hull-component-reporting')
      */
      .use('lib/client/component/api')
      .use('lib/client/component/actions')
      .use('lib/client/component/component')
      .use('lib/client/component/templates');

    app.start();
    
  }

  api = {
    init: init
  };

  return api;

});
