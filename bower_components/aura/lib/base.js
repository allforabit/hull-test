(function() {
  if (window.jQuery) {
    define('jquery', [], function () {
      return window.jQuery;
    });
  } else {
    require.config({
      paths: {
        jquery:     'bower_components/jquery/jquery'
      },
      shim: {
        jquery:     { exports: '$' }
      }
    });
  }

  if (window._) {
    define('underscore', [], function () {
      return window._;
    });
  } else {
    require.config({
      paths: {
        underscore: 'bower_components/underscore/underscore'
      },
      shim: {
        underscore: { exports: '_' }
      }
    });
  }

  define(['module', 'underscore', 'jquery', './platform'], function(module, _, $, platform) {

    // Auto configure aura path... if not set yet...
    if (!require.s.contexts._.config.paths.aura) {
      require.config({ paths: { aura: module.id.replace(/base$/, '') }});
    }

    var base = {};

    base.dom = {
      find: function(selector, context) {
        context = context || document;
        return $(context).find(selector);
      },
      data: function(selector, attribute, value) {
        if(value===undefined){
          return $(selector).data(attribute);
        } else {
          return $(selector).data(attribute, value);
        }
      }
    };

    base.data = {
      ajax: $.ajax,
      deferred: $.Deferred,
      //Handle an Array or arguments seamlessly, Return a Deferred.
      when:     function(){
        if(_.isArray(arguments[0])){
          return $.when.call(undefined, arguments[0]);
        } else {
          return $.when.apply(undefined, [].slice.call(arguments));
        }
      },
      // Using the following method instead of a direct call to .promise will help decouple the Promises library later
      promise:  function(dfd){
        if(_.isFunction(dfd.promise)){
          return dfd.promise();
        } else {
          return dfd.promise;
        }
      }
    },

    base.util = {
      each:   _.each,
      extend: _.extend,
      uniq:   _.uniq,
      _:      _,
      decamelize: function(camelCase, delimiter) {
        delimiter = (delimiter === undefined) ? '_' : delimiter;
        return camelCase.replace(/([A-Z])/g, delimiter + '$1').toLowerCase();
      }
    };

    base.events = {
      listen: function(context, events, selector, callback) {
        return $(context).on(events, selector, callback);
      },
      bindAll: function() {
        return _.bindAll.apply(this, arguments);
      }
    };

    base.template = {
      parse: _.template
    };

    return base;

  });

})();
