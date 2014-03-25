(function() {
  define(['underscore'], function(_) {

    /*
     * Parses the parameters for an API call. At this point, they can have two forms
     * * [String, ...] where the String is an uri. The request will be made to the default provider
     * * [Object, ...] where the Object describes more completely the request. It must provide a "path" key, can provide a "provider" key as well as some default parameters in the "params" key
     * In the second form, the optional params can be overridden through parameters at data.api calls
     *
     * The normalized form is the first one.
     *
     * @param {Array} the parameters for the API calls
     * @return {Array} The normalized form of parameters
     */
    var defaultProvider, _objectDescription, _stringDescription;
    defaultProvider = 'hull';
    _stringDescription = function(desc) {
      return [desc, defaultProvider, {}];
    };
    _objectDescription = function(desc) {
      var params, path, provider;
      path = desc.path;
      provider = desc.provider || defaultProvider;
      params = desc.params || {};
      return [path, provider, params];
    };
    return {
      parse: function(argsArray) {
        var callback, description, errback, method, next, params, path, provider, ret, type, _ref, _ref1;
        description = argsArray.shift();
        if (_.isString(description)) {
          _ref = _stringDescription(description), path = _ref[0], provider = _ref[1], params = _ref[2];
        }
        if (_.isObject(description)) {
          _ref1 = _objectDescription(description), path = _ref1[0], provider = _ref1[1], params = _ref1[2];
        }
        if (!path) {
          throw 'No URI provided for the API call';
        }
        if (path[0] === "/") {
          path = path.substring(1);
        }
        ret = [];
        if (params != null) {
          ret.push(params);
        }
        ret = ret.concat(argsArray);
        callback = errback = null;
        params = {};
        while ((next = ret.shift())) {
          type = typeof next;
          if (type === 'string' && !method) {
            method = next.toLowerCase();
          } else if (type === 'function' && (!callback || !errback)) {
            if (!callback) {
              callback = next;
            } else if (!errback) {
              errback = next;
            }
          } else if (type === 'object') {
            params = _.extend(params, next);
          } else {
            throw new TypeError("Invalid argument passed to Hull.api(): " + next);
          }
        }
        if (method == null) {
          method = 'get';
        }
        if (callback == null) {
          callback = function() {};
        }
        if (errback == null) {
          errback = function(data) {
            return console.error('The request has failed: ', data);
          };
        }
        return [
          {
            provider: provider,
            path: path,
            method: method,
            params: params
          }, callback, errback
        ];
      }
    };
  });

}).call(this);
