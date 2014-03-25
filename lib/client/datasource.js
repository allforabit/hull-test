(function() {
  define(['lib/utils/promises', 'underscore', 'backbone'], function(promises, _, Backbone) {
    var Datasource, parseLinkHeader, parseQueryString, parseURI;
    parseLinkHeader = function(header) {
      var links;
      links = {};
      if (header != null) {
        header.replace(/<([^>]*)>;\s*rel="([\w]*)\"/g, function(match, url, rel) {
          return links[rel] = url;
        });
      }
      return links;
    };
    parseQueryString = function(path) {
      var params;
      path = path.split('?')[1] || path;
      params = {};
      path.replace(/([^?&=]+)(=([^&]*))?/g, function(match, key, $, value) {
        if (value != null) {
          return params[key] = value;
        }
      });
      return params;
    };
    parseURI = function(uri, bindings) {
      var p, placeHolders, _i, _key, _len;
      placeHolders = uri.match(/(\:[a-zA-Z0-9-_]+)/g);
      if (!placeHolders) {
        return uri;
      }
      for (_i = 0, _len = placeHolders.length; _i < _len; _i++) {
        p = placeHolders[_i];
        _key = p.slice(1);
        if (!_.has(bindings, _key)) {
          throw new Error("Cannot resolve datasource binding " + p);
        }
        uri = uri.replace(p, bindings[_key]);
      }
      return uri;
    };
    Datasource = (function() {
      function Datasource(ds, transport) {
        var params, _errDefinition, _errTransport;
        if (ds instanceof Backbone.Model || ds instanceof Backbone.Collection) {
          this.def = ds;
          return;
        }
        this.transport = transport;
        _errDefinition = new TypeError('Datasource is missing its definition. Cannot continue.');
        _errTransport = new TypeError('Datasource is missing a transport. Cannot continue.');
        if (!ds) {
          throw _errDefinition;
        }
        if (!this.transport) {
          throw _errTransport;
        }
        if (_.isString(ds)) {
          ds = {
            path: ds,
            provider: 'hull'
          };
        } else if (_.isObject(ds) && !_.isFunction(ds)) {
          if (!ds.path) {
            throw _errDefinition;
          }
          ds.provider = ds.provider || 'hull';
        }
        if (!_.isFunction(ds)) {
          params = ds.params || {};
          ds.params = _.extend(parseQueryString(ds.path), params);
          ds.path = ds.path.split('?')[0];
        }
        this.def = ds;
      }

      Datasource.prototype.parse = function(bindings) {
        if (!(this.def instanceof Backbone.Model || this.def instanceof Backbone.Collection)) {
          if (!_.isFunction(this.def)) {
            this.def.path = parseURI(this.def.path, bindings);
          }
          if (!_.isFunction(this.def)) {
            return this.def.provider = parseURI(this.def.provider, bindings);
          }
        }
      };

      Datasource.prototype.fetch = function() {
        var dfd, ret, transportDfd;
        dfd = promises.deferred();
        if (this.def instanceof Backbone.Model || this.def instanceof Backbone.Collection) {
          dfd.resolve(this.def);
        } else if (_.isFunction(this.def)) {
          ret = this.def.call();
          if (ret != null ? ret.promise : void 0) {
            return promises.when(ret);
          } else {
            dfd.resolve(ret);
          }
        } else {
          if (/undefined/.test(this.def.path)) {
            dfd.resolve(false);
            return dfd.promise;
          }
          transportDfd = this.transport(this.def);
          transportDfd.then((function(_this) {
            return function(obj, headers) {
              if (_.isArray(obj)) {
                if (headers != null ? headers.Link : void 0) {
                  _this.paginationLinks = parseLinkHeader(headers['Link']);
                }
                return dfd.resolve(new Backbone.Collection(obj));
              } else {
                return dfd.resolve(new Backbone.Model(obj));
              }
            };
          })(this), function(err) {
            return dfd.reject(err);
          });
        }
        return dfd.promise;
      };

      Datasource.prototype.isPaginable = function() {
        return this.paginationLinks != null;
      };

      Datasource.prototype.isFirst = function() {
        var _ref;
        return !((_ref = this.paginationLinks) != null ? _ref.first : void 0);
      };

      Datasource.prototype.isLast = function() {
        var _ref;
        return !((_ref = this.paginationLinks) != null ? _ref.last : void 0);
      };

      Datasource.prototype.previous = function() {
        if (!this.isFirst()) {
          return _.extend(this.def.params, parseQueryString(this.paginationLinks.prev));
        }
      };

      Datasource.prototype.next = function() {
        if (!this.isLast()) {
          return _.extend(this.def.params, parseQueryString(this.paginationLinks.next));
        }
      };

      Datasource.prototype.sort = function(field, direction) {
        if (direction == null) {
          direction = 'ASC';
        }
        return this.def.params.order_by = field + ' ' + direction;
      };

      Datasource.prototype.where = function(query, extend) {
        if (extend == null) {
          extend = false;
        }
        if (extend) {
          query = _.extend(this.def.params.where, query);
        }
        this.def.params.where = query;
        return this.def.params.page = 1;
      };

      return Datasource;

    })();
    return Datasource;
  });

}).call(this);
