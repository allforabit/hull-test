(function() {
  define(['underscore', 'lib/utils/promises'], function(_, promises) {
    var Context, onDataError, _dfd;
    onDataError = function(datasourceName, err) {
      return console.log("An error occurred with datasource " + datasourceName, err);
    };
    _dfd = promises.deferred;
    return Context = (function() {
      function Context() {
        this._context = {};
        this._errors = {};
      }

      Context.prototype.add = function(name, value) {
        return this._context[name] = value;
      };

      Context.prototype.addDatasource = function(name, dsPromise, fallback) {
        var dfd;
        if (!_.isFunction(fallback)) {
          fallback = _.bind(onDataError, void 0, name);
        }
        dfd = _dfd();
        dsPromise.then((function(_this) {
          return function(res) {
            if (_.isFunction(res != null ? res.toJSON : void 0)) {
              _this.add(name, res.toJSON());
            } else if (_.isArray(res) && res[1] === 'success' && res[2].status === 200) {
              _this.add(name, res[0]);
            } else {
              _this.add(name, res);
            }
            return dfd.resolve(res);
          };
        })(this), (function(_this) {
          return function(err) {
            var resolved;
            _this._errors[name] = err;
            resolved = fallback(err);
            _this.add(name, resolved);
            return dfd.resolve(resolved);
          };
        })(this));
        return dfd.promise;
      };

      Context.prototype.errors = function() {
        var countKeys;
        countKeys = _.keys(this._errors).length;
        if (!countKeys) {
          return null;
        }
        return this._errors;
      };

      Context.prototype.build = function() {
        return this._context;
      };

      return Context;

    })();
  });

}).call(this);
