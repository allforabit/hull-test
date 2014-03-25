require.config({
  baseUrl: '/hull-test/',
  paths: {
    'jquery':         'bower_components/jquery/jquery',
    'json2':          'bower_components/json2/json2',
    'requireLib':     'bower_components/requirejs/require',
    'underscore':     'bower_components/underscore/underscore',
    'eventemitter':   'bower_components/eventemitter2/lib/eventemitter2',
    'backbone':       'bower_components/backbone/backbone',
    'xdm':            'bower_components/xdm.js/xdm',
    'handlebars':     'bower_components/handlebars/handlebars.amd',
    'cookie':         'bower_components/cookies-js/src/cookies',
    'promises':       'bower_components/q/q',
    'string':         'bower_components/underscore.string/lib/underscore.string',
    'text':           'bower_components/requirejs-text/text',
    'base64':         'bower_components/base64/base64',
    'aura':           'bower_components/aura/lib',
    'domready':       'bower_components/domready/ready',
    'moment':         'bower_components/moment/moment',
    'purl':           'bower_components/purl/purl',
    'hullApi':        'lib/hull.api',
    'hull':           'lib/hull'
  },
  shim: {
    'backbone':   { exports: 'Backbone', deps: ['underscore', 'jquery'] },
    'underscore': { exports: '_' },
    'jquery': { exports: 'jquery'}
  }
});

require(['scripts/app'], function(app) {

  var config;

  config = _.extend(hullConfig, {
    namespace: 'hull',
    sources: {
      'default' : '/hull-test/components',
    }
  });

  app.init(config).then(function(appParts){
    appParts.app.use('extensions/rivets');
    appParts.app.use('extensions/services/events');
    app.success(appParts);
  });



});
