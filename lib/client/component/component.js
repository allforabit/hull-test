(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['underscore', 'lib/utils/q2jquery', 'lib/client/component/context', 'lib/utils/promises'], function(_, q2jQuery, Context, promises) {
    var _invokeBeforeRender;
    _invokeBeforeRender = function(data, ctx) {
      var dfd;
      dfd = promises.deferred();
      this.invokeWithCallbacks('beforeRender', ctx.build(), ctx.errors()).then((function(_this) {
        return function(_data) {
          data = _.extend({}, _this.data, _data || ctx.build(), data);
          return dfd.resolve(data);
        };
      })(this), function(err) {
        console.error(err);
        return dfd.reject(err);
      });
      return q2jQuery(dfd.promise);
    };
    return function(app) {
      var HullComponent, debug, module;
      debug = false;
      HullComponent = (function(_super) {
        __extends(HullComponent, _super);

        HullComponent.prototype.initialize = function() {};

        HullComponent.prototype.isInitialized = false;

        HullComponent.prototype.options = {};

        function HullComponent(options) {
          this.render = __bind(this.render, this);
          this.afterRender = __bind(this.afterRender, this);
          this.doRender = __bind(this.doRender, this);
          this.getTemplate = __bind(this.getTemplate, this);
          this.loggedIn = __bind(this.loggedIn, this);
          this.buildContext = __bind(this.buildContext, this);
          this.log = __bind(this.log, this);
          this.renderTemplate = __bind(this.renderTemplate, this);
          var k, v, _ref;
          this.ref = options.ref;
          this.api = this.sandbox.data.api;
          if (this.refresh == null) {
            this.refresh = _.throttle((function() {
              return this.invokeWithCallbacks('render');
            }), 200);
          }
          this.componentName = options.name;
          _ref = this.options;
          for (k in _ref) {
            v = _ref[k];
            options[k] || (options[k] = v);
          }
          if (this.className == null) {
            this.className = "hull-component";
            if (this.namespace != null) {
              this.className += " hull-" + this.namespace;
            }
          }
          this.cid = _.uniqueId('view');
          this._configure(options || {});
          this._ensureElement();
          this.invokeWithCallbacks('initialize', options).then(_.bind(function() {
            var refreshOn, _i, _len, _ref1, _results;
            this.delegateEvents();
            this.invokeWithCallbacks('render');
            this.sandbox.on('hull.settings.update', (function(_this) {
              return function(conf) {
                return _this.sandbox.config.services = conf;
              };
            })(this));
            _ref1 = this.refreshEvents || [];
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              refreshOn = _ref1[_i];
              _results.push(this.sandbox.on(refreshOn, ((function(_this) {
                return function() {
                  return _this.refresh();
                };
              })(this)), this));
            }
            return _results;
          }, this), function(err) {
            return console.warn('WARNING', err);
          });
        }

        HullComponent.prototype.renderTemplate = function(tpl, data) {
          var _ref, _tpl;
          _tpl = (_ref = this._templates) != null ? _ref[tpl] : void 0;
          if (_tpl) {
            return _tpl(data || this, {
              helpers: _.extend({}, this.helpers)
            });
          } else {
            return "Cannot find template '" + tpl + "'";
          }
        };

        HullComponent.prototype.authServices = function() {
          return this.sandbox.util._.reject(this.sandbox.util._.keys(this.sandbox.config.services.auth || {}), function(service) {
            return service === 'hull';
          });
        };

        HullComponent.prototype.beforeRender = function(data) {
          return data;
        };

        HullComponent.prototype.renderError = function() {};

        HullComponent.prototype.log = function(msg) {
          if (this.options.debug) {
            return console.warn(this.options.name, ":", this.options.id, msg);
          } else {
            return console.warn("[DEBUG] " + this.options.name, msg, this);
          }
        };

        HullComponent.prototype.buildContext = function(ctx) {
          if (this._renderCount == null) {
            this._renderCount = 0;
          }
          ctx.add('options', this.options);
          ctx.add('loggedIn', this.loggedIn());
          ctx.add('isAdmin', this.sandbox.isAdmin());
          ctx.add('debug', this.sandbox.config.debug);
          ctx.add('renderCount', ++this._renderCount);
          return ctx;
        };

        HullComponent.prototype.loggedIn = function() {
          var identities, me;
          if (this.sandbox.data.api.model('me').id == null) {
            return false;
          }
          identities = {};
          me = this.sandbox.data.api.model('me');
          _.map(me.get("identities"), function(i) {
            return identities[i.provider] = i;
          });
          if (me.get('main_identity') === 'email') {
            if (identities.email == null) {
              identities.email = {};
            }
          }
          return identities;
        };

        HullComponent.prototype.getTemplate = function(tpl, data) {
          var _ref;
          return tpl || this.template || ((_ref = this.templates) != null ? _ref[0] : void 0);
        };

        HullComponent.prototype.doRender = function(tpl, data) {
          var ret, tplName;
          tplName = this.getTemplate(tpl, data);
          ret = this.renderTemplate(tplName, data);
          this.$el.addClass(this.className);
          if (debug) {
            ret = "<!-- START " + tplName + " RenderCount: " + this._renderCount + " -->" + ret + "<!-- END " + tplName + "-->";
          }
          this.$el.html(ret);
          return this;
        };

        HullComponent.prototype.afterRender = function(data) {
          return data;
        };

        HullComponent.prototype.render = function(tpl, data) {
          return this.invokeWithCallbacks('buildContext', new Context()).then(_.bind(_invokeBeforeRender, this, data)).then((function(_this) {
            return function(data) {
              _this.invokeWithCallbacks('doRender', tpl, data);
              _.defer(_this.afterRender.bind(_this, data));
              _.defer((function() {
                return this.sandbox.start(this.$el, {
                  reset: true
                });
              }).bind(_this));
              _this.isInitialized = true;
              return _this.emitLifecycleEvent('render');
            };
          })(this), (function(_this) {
            return function(err) {
              console.error(err.message);
              return _this.renderError(err);
            };
          })(this));
        };

        HullComponent.prototype.emitLifecycleEvent = function(name) {
          return this.sandbox.emit("hull." + (this.componentName.replace('/', '.')) + "." + name, {
            cid: this.cid
          });
        };

        return HullComponent;

      })(app.core.mvc.View);
      module = {
        initialize: function(app) {
          debug = app.config.debug;
          return app.components.addType("Hull", HullComponent.prototype);
        }
      };
      return module;
    };
  });

}).call(this);
