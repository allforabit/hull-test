(function() {
  var __slice = [].slice;

  define(['underscore', 'lib/utils/handlebars', 'lib/utils/handlebars-helpers', 'lib/utils/promises', 'lib/utils/q2jquery', 'require'], function(_, Handlebars, hbsHelpers, promises, q2jQuery, require) {
    var applyAppStrategies, applyDomStrategies, applyServerStrategies, lookupTemplate, module, setupTemplate, strategies, strategyHandlers, _domTemplate, _execute;
    strategies = {
      app: ['hullGlobal', 'meteor', 'sprockets', 'hullDefault'],
      dom: ['inner', 'global'],
      server: ['require']
    };
    setupTemplate = function(tplSrc, tplName, wrapped, options) {
      var compiled;
      if (!_.isFunction(tplSrc)) {
        compiled = Handlebars.compile(tplSrc);
      } else if (!wrapped) {
        compiled = Handlebars.template(tplSrc, options);
      } else {
        compiled = tplSrc;
      }
      Handlebars.registerPartial(tplName, compiled);
      return compiled;
    };
    _domTemplate = function($el) {
      var $first, first;
      if (!$el.length) {
        return;
      }
      first = $el.get(0);
      $first = module.domFind(first);
      return $first.text() || $first.html() || first.innerHTML;
    };
    strategyHandlers = {
      dom: {
        inner: function(selector, tplName, el) {
          var $el;
          $el = module.domFind(selector, el);
          return _domTemplate($el);
        },
        global: function(selector, tplName) {
          var $el;
          $el = module.domFind(selector, document);
          return _domTemplate($el);
        }
      },
      app: {
        hullGlobal: function(tplName) {
          var _ref;
          if ((_ref = module.global.Hull.templates) != null ? _ref[tplName] : void 0) {
            return [module.global.Hull.templates["" + tplName], tplName, false];
          }
        },
        meteor: function(tplName) {
          var _ref;
          if ((module.global.Meteor != null) && (((_ref = module.global.Template) != null ? _ref[tplName] : void 0) != null)) {
            return [module.global.Template[tplName], tplName, false];
          }
        },
        sprockets: function(tplName) {
          var _ref;
          if ((module.global.HandlebarsTemplates != null) && (((_ref = module.global.HandlebarsTemplates) != null ? _ref[tplName] : void 0) != null)) {
            return [module.global.HandlebarsTemplates[tplName], tplName, true];
          }
        },
        hullDefault: function(tplName) {
          var _ref, _ref1;
          if ((_ref = module.global.Hull.templates) != null ? (_ref1 = _ref._default) != null ? _ref1[tplName] : void 0 : void 0) {
            return [module.global.Hull.templates._default[tplName], tplName, false];
          }
        }
      },
      server: {
        require: function(tplName, path, format) {
          var dfd;
          path = "text!" + path + "." + format;
          dfd = promises.deferred();
          module.require([path], function(tpl) {
            return dfd.resolve([tpl, tplName, false]);
          }, function(err) {
            console.error("Error loading template", tplName, err.message);
            return dfd.reject(err);
          });
          return dfd.promise;
        }
      }
    };
    _execute = function() {
      var args, stratName, strategyResult, type, _i, _len, _ref, _ref1;
      type = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = strategies[type];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        stratName = _ref[_i];
        strategyResult = (_ref1 = strategyHandlers[type])[stratName].apply(_ref1, args);
        if (strategyResult) {
          return strategyResult;
        }
      }
    };
    applyDomStrategies = function(tplName, el) {
      var selector, tpl;
      selector = "script[data-hull-template='" + tplName + "']";
      tpl = _execute('dom', selector, tplName, el);
      if (tpl) {
        return [tpl, tplName, false];
      }
    };
    applyAppStrategies = function(tplName) {
      return _execute('app', tplName);
    };
    applyServerStrategies = function(tplName, path, format) {
      return _execute('server', tplName, path, format);
    };
    lookupTemplate = function(options, name) {
      var params, path, tpl, tplName;
      path = "" + options.ref + "/" + name;
      tplName = [options.componentName, name.replace(/^_/, '')].join("/");
      if (module.domFind) {
        params = applyDomStrategies(tplName, options.rootEl);
      }
      if (!params) {
        params = applyAppStrategies(tplName);
      }
      if (params) {
        tpl = setupTemplate.apply(null, params);
        module.define(path, tpl);
      } else {
        tpl = applyServerStrategies(tplName, path, options.templateFormat).then(function(params) {
          return setupTemplate.apply(null, params);
        });
      }
      return tpl;
    };
    module = {
      global: window,
      define: define,
      require: require,
      domFind: void 0,
      load: function(names, ref, el, format) {
        var componentProps, dfd, tpls;
        if (names == null) {
          names = [];
        }
        if (format == null) {
          format = "hbs";
        }
        dfd = promises.deferred();
        if (_.isString(names)) {
          names = [names];
        }
        componentProps = {
          componentName: ref.replace('__component__$', '').split('@')[0],
          templateFormat: format,
          rootEl: el,
          ref: ref
        };
        tpls = _.map(names, _.bind(lookupTemplate, void 0, componentProps));
        promises.all(tpls).then(function(ary) {
          return dfd.resolve(_.object(names, ary));
        }, function(err) {
          console.warn('WARNING', err);
          return dfd.reject(err);
        });
        return dfd.promise;
      },
      initialize: function(app) {
        var k, v, _ref;
        _ref = hbsHelpers(app);
        for (k in _ref) {
          v = _ref[k];
          Handlebars.registerHelper(k, v);
        }
        module.domFind = app.core.dom.find;
        app.components.before('initialize', function() {
          var promise;
          promise = module.load(this.templates, this.ref, this.el).then((function(_this) {
            return function(tpls) {
              return _this._templates = tpls;
            };
          })(this), function(err) {
            console.error('Error while loading templates:', err);
            throw err;
          });
          return q2jQuery(promise);
        });
        return null;
      }
    };
    return module;
  });

}).call(this);
