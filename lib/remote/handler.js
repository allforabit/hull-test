(function() {
  define(['jquery', 'underscore'], function($, _) {
    var API_PATH, API_PATH_REGEXP, Handler, batchable, handler, normalizePath;
    API_PATH = '/api/v1/';
    API_PATH_REGEXP = /^\/?api\/v1\//;
    normalizePath = function(path) {
      if (API_PATH_REGEXP.test(path)) {
        return path.replace(API_PATH_REGEXP, API_PATH);
      }
      if (path[0] === '/') {
        path = path.substring(1);
      }
      return API_PATH + path;
    };
    batchable = function(threshold, fn) {
      var args, timeout;
      args = [];
      timeout = null;
      return function() {
        var context, delayed;
        context = this;
        args.push(Array.prototype.slice.call(arguments));
        delayed = function() {
          fn.call(context, args);
          timeout = null;
          return args = [];
        };
        clearTimeout(timeout);
        return timeout = setTimeout(delayed, threshold);
      };
    };
    handler = Handler = (function() {
      var RESPONSE_HEADERS;

      RESPONSE_HEADERS = ['Hull-Auth-Scope', 'Hull-Track', 'Hull-User-Id', 'Hull-User-Sig', 'Link'];

      function Handler(options) {
        var _base, _base1, _base2;
        if (options == null) {
          options = {};
        }
        this.options = options;
        if ((_base = this.options).min == null) {
          _base.min = 1;
        }
        if ((_base1 = this.options).max == null) {
          _base1.max = 15;
        }
        if ((_base2 = this.options).delay == null) {
          _base2.delay = 2;
        }
        this.headers = this.options.headers || {};
        this.afterCallbacks = [];
        this.queue = batchable(this.options.delay, function(requests) {
          return this.flush(requests);
        });
      }

      Handler.prototype.handle = function(request) {
        var d, promise;
        request.url = normalizePath(request.url);
        d = new $.Deferred();
        this.queue(request, d);
        promise = d.promise();
        if (request != null ? request.nocallback : void 0) {
          return promise;
        }
        _.each(this.afterCallbacks, function(cb) {
          return promise.then(cb, cb);
        });
        return promise;
      };

      Handler.prototype.flush = function(requests) {
        var deferred, request, _ref, _results;
        if (requests.length <= this.options.min) {
          _results = [];
          while (requests.length) {
            _ref = requests.pop(), request = _ref[0], deferred = _ref[1];
            _results.push(this.handleOne(request, deferred));
          }
          return _results;
        } else {
          this.handleMultiple(requests.splice(0, this.options.max));
          if (requests.length) {
            return this.flush(requests);
          }
        }
      };

      Handler.prototype.handleOne = function(request, deferred) {
        return this.ajax(request).then(function(r, status, xhr) {
          var headers;
          headers = _.reduce(RESPONSE_HEADERS, function(memo, name) {
            var value;
            value = xhr.getResponseHeader(name);
            if (value != null) {
              memo[name] = value;
            }
            return memo;
          }, {});
          return deferred.resolve({
            response: r,
            headers: headers,
            request: request
          });
        }, function(xhr) {
          return deferred.reject({
            response: xhr.responseJSON,
            headers: {},
            request: request
          });
        });
      };

      Handler.prototype.handleMultiple = function(requests) {
        return this.ajax({
          type: 'post',
          url: '/api/v1/batch',
          data: this.formatBatchParams(requests)
        }).then(function(r) {
          var deferred, h, headers, i, response, _i, _len, _ref, _results;
          _ref = r.results;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            response = _ref[i];
            deferred = requests[i][1];
            headers = _.reduce(RESPONSE_HEADERS, function(memo, name) {
              var value;
              value = response.headers[name];
              if (value != null) {
                memo[name] = value;
              }
              return memo;
            }, {});
            h = {
              response: response.body,
              headers: headers,
              request: requests[i]
            };
            if (response.status >= 400) {
              _results.push(deferred.reject(h));
            } else {
              _results.push(deferred.resolve(h));
            }
          }
          return _results;
        }, function(xhr) {
          var request, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = requests.length; _i < _len; _i++) {
            request = requests[_i];
            _results.push(request[1].reject({
              response: xhr.responseJSON,
              headers: {},
              request: request
            }));
          }
          return _results;
        });
      };

      Handler.prototype.after = function(fn) {
        return this.afterCallbacks.push(fn);
      };

      Handler.prototype.ajax = function(options) {
        options = $.extend(true, options, {
          contentType: 'application/json',
          dataType: 'json',
          headers: this.headers
        });
        if (options.type == null) {
          options.type = 'get';
        }
        if (options.type.toLowerCase() !== 'get') {
          options.data = JSON.stringify(options.data || {});
        }
        return $.ajax(options);
      };

      Handler.prototype.formatBatchParams = function(requests) {
        var c, data, r, request;
        data = {
          sequential: true
        };
        data.ops = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = requests.length; _i < _len; _i++) {
            request = requests[_i];
            r = request[0];
            c = {};
            c.method = r.type;
            c.url = r.url;
            if (r.data != null) {
              c.params = r.data;
            }
            if (r.headers != null) {
              c.headers = r.headers;
            }
            _results.push(c);
          }
          return _results;
        })();
        return data;
      };

      return Handler;

    })();
    return {
      handler: handler,
      initialize: function(app) {
        var accessToken, headers;
        headers = {
          'Hull-App-Id': app.config.appId
        };
        accessToken = app.config.access_token;
        if (accessToken) {
          headers['Hull-Access-Token'] = accessToken;
        }
        return app.core.handler = new handler({
          headers: headers
        });
      },
      afterAppStart: function(app) {
        return app.sandbox.on('remote.settings.update', function(settings) {
          var header, _ref, _ref1, _ref2;
          header = (_ref = settings.auth) != null ? (_ref1 = _ref.hull) != null ? (_ref2 = _ref1.credentials) != null ? _ref2.access_token : void 0 : void 0 : void 0;
          if (header) {
            return app.core.handler.headers['Hull-Access-Token'] = header;
          } else {
            return delete app.core.handler.headers['Hull-Access-Token'];
          }
        });
      }
    };
  });

}).call(this);
