//todo don't hardcode
var PLATFORM = 'web';

require.config({
  baseUrl: '../..',
  paths: {
    jquery:         'bower_components/jquery/jquery',
    json2:          'bower_components/json2/json2',
    requireLib:     'bower_components/requirejs/require',
    underscore:     'bower_components/underscore/underscore',
    eventemitter:   'bower_components/eventemitter2/lib/eventemitter2',
    backbone:       'bower_components/backbone/backbone',
    xdm:            'bower_components/xdm.js/xdm',
    handlebars:     'bower_components/handlebars/handlebars.amd',
    cookie:         'bower_components/cookies-js/src/cookies',
    promises:       'bower_components/q/q',
    string:         'bower_components/underscore.string/lib/underscore.string',
    text:           'bower_components/requirejs-text/text',
    base64:         'bower_components/base64/base64',
    aura:           'bower_components/aura/lib',
    domready:       'bower_components/domready/ready',
    moment:         'bower_components/moment/moment',
    purl:           'bower_components/purl/purl'
  },
  shim: {
    backbone:   { exports: 'Backbone', deps: ['underscore', 'jquery'] },
    underscore: { exports: '_' },
    jquery    : { exports: 'jquery'}
  }
});

require(['scripts/'+PLATFORM+'/app', 'underscore'], function(app, _) {

  var config = _.extend(hullConfig, {
    sources: { 'default' : '/components' }
  });

  app.init(config);


});
