(function() {
  define(['underscore'], function(_) {
    var module;
    module = {
      initialize: function(app) {
        return app.components.before('initialize', module.registerActions);
      },
      defaultActions: ['login', 'logout', 'linkIdentity', 'unlinkIdentity'],
      selectAction: function(action, scope) {
        var fn;
        fn = scope.actions[action] || scope["" + action + "Action"];
        if (_.isString(fn)) {
          fn = scope[fn];
        }
        if (!_.isFunction(fn)) {
          throw new Error("Can't find action " + action + " on this component");
        }
        return fn;
      },
      formatActionData: function(data) {
        var formattedData, k, v, _fn;
        formattedData = {};
        _fn = function() {
          var key;
          key = k.replace(/^hull/, "");
          key = key.charAt(0).toLowerCase() + key.slice(1);
          return formattedData[key] = v;
        };
        for (k in data) {
          v = data[k];
          _fn();
        }
        return formattedData;
      },
      actionHandler: function(e) {
        var action, data, err, fn, source;
        source = this.sandbox.dom.find(e.currentTarget);
        console.log(source);
        action = source.data("hull-action");
        data = module.formatActionData(source.data());
        try {
          fn = module.selectAction(action, this);
          return fn.call(this, e, {
            el: source,
            data: data
          });
        } catch (_error) {
          err = _error;
          return console.error("Error in action handler: ", action, err.message, err);
        } finally {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      },
      registerActions: function() {
        var e;
        e = _.isFunction(this.events) ? this.events() : this.events;
        this.events = _.defaults({
          "click [data-hull-action]": _.bind(module.actionHandler, this)
        }, e);
        this.actions = _.isFunction(this.actions) ? this.actions() : this.actions;
        if (this.actions == null) {
          this.actions = {};
        }
        return _.each(module.defaultActions, function(action) {
          var _base;
          return (_base = this.actions)[action] != null ? _base[action] : _base[action] = (function(_this) {
            return function(e, params) {
              return _this.sandbox[action](params.data.provider, params.data);
            };
          })(this);
        }, this);
      }
    };
    return module;
  });

}).call(this);
