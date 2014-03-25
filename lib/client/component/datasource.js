(function() {
  define(['lib/client/datasource', 'underscore', 'lib/utils/promises', 'lib/utils/q2jquery', 'string'], function(Datasource, _, promises, q2jQuery) {
    var module;
    module = {
      datasourceModel: Datasource,
      getDatasourceErrorHandler: function(name, scope) {
        var handler;
        handler = scope["on" + (_.string.capitalize(_.string.camelize(name))) + "Error"];
        if (!_.isFunction(handler)) {
          handler = module.defaultErrorHandler;
        }
        return _.bind(handler, scope, name);
      },
      defaultErrorHandler: function(datasourceName, err) {
        return console.warn("An error occurred with datasource " + datasourceName, err.status, err.statusText);
      },
      addDatasources: function(datasources) {
        var _builtDs;
        if (datasources == null) {
          datasources = {};
        }
        _builtDs = _.map(datasources, (function(_this) {
          return function(ds, i) {
            if (_.isFunction(ds)) {
              ds = _.bind(ds, _this);
            }
            if (!(ds instanceof module.datasourceModel)) {
              ds = new module.datasourceModel(ds, _this.api);
            }
            return ds;
          };
        })(this));
        return this.datasources = _.object(_.keys(datasources), _builtDs);
      },
      fetchDatasources: function() {
        var context, promiseArray;
        context = [].pop.apply(arguments);
        if (this.data == null) {
          this.data = {};
        }
        promiseArray = _.map(this.datasources, (function(_this) {
          return function(ds, k) {
            var fetcher, handler;
            ds.parse(_.extend({}, _this, _this.options || {}));
            handler = module.getDatasourceErrorHandler(k, _this);
            fetcher = ds.fetch();
            promises.when(fetcher, function(res) {
              return _this.data[k] = res;
            });
            return context.addDatasource(k, fetcher, handler);
          };
        })(this));
        return q2jQuery(promises.all(promiseArray));
      },
      initialize: function(app) {
        var default_datasources;
        default_datasources = {
          me: new module.datasourceModel(app.core.data.api.model('me')),
          app: new module.datasourceModel(app.core.data.api.model('app')),
          org: new module.datasourceModel(app.core.data.api.model('org'))
        };
        app.components.before('initialize', function(options) {
          var datasources;
          datasources = _.extend({}, default_datasources, this.datasources, options.datasources);
          return module.addDatasources.call(this, datasources);
        });
        return app.components.after('buildContext', module.fetchDatasources);
      }
    };
    return module;
  });

}).call(this);
