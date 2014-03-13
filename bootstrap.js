(function() {
  var ENV, createLock, createPool, currentFlavour, deletePool, failureCb, initApi, initMain, lock, preInit, rerun, successCb, _extend, _hull, _mainCalled, _pool,
    __slice = [].slice;

  if (!(window.console && console.log)) {
    (function() {
      var console, length, methods, noop, _results;
      noop = function() {};
      methods = ["assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd", "markTimeline", "table", "time", "timeEnd", "timeStamp", "trace", "warn"];
      length = methods.length;
      console = window.console = {};
      _results = [];
      while (length--) {
        _results.push(console[methods[length]] = noop);
      }
      return _results;
    })();
  }

  ENV = typeof HULL_ENV !== "undefined" && HULL_ENV !== null ? HULL_ENV : '';

  _extend = null;

  currentFlavour = null;

  createLock = function() {
    var _cbs, _open;
    _open = false;
    _cbs = [];
    return {
      run: function(cb) {
        if (_open) {
          return cb();
        } else {
          return _cbs.push(cb);
        }
      },
      unlock: function() {
        var cb, _i, _len, _results;
        _open = true;
        _results = [];
        for (_i = 0, _len = _cbs.length; _i < _len; _i++) {
          cb = _cbs[_i];
          _results.push(cb());
        }
        return _results;
      }
    };
  };

  _pool = _pool || {};

  createPool = function(name) {
    if (_pool[name] == null) {
      _pool[name] = [];
    }
    return function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return _pool[name].push(args);
    };
  };

  deletePool = function(name) {
    return delete _pool[name];
  };

  rerun = function(name, withObj) {
    var data, _i, _len, _ref;
    _ref = _pool[name];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      data = _ref[_i];
      withObj[name].apply(withObj, data);
    }
    return deletePool(name);
  };

  lock = createLock();

  _mainCalled = false;

  preInit = function(isMain, config, cb, errb) {
    if (isMain && _mainCalled) {
      throw new Error('Hull.init can be called only once');
    }
    if (isMain) {
      _mainCalled = true;
    }
    return lock.run(function() {
      var _config, _failure, _success;
      _config = _extend({}, config);
      _config.namespace = 'hull';
      _config.debug = config.debug && {
        enable: true
      };
      _success = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return successCb.apply(null, [config, isMain, cb || function() {}].concat(args));
      };
      _failure = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return failureCb.apply(null, [isMain, errb || function() {}].concat(args));
      };
      currentFlavour.init(_config).then(_success, _failure).done();
      return console.info("Hull.js version \"" + _hull.version + "\" started");
    });
  };

  initApi = function() {
    var args, config;
    config = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    config.apiOnly = true;
    return preInit.apply(null, [false, config].concat(args));
  };

  initMain = function() {
    var args, config;
    config = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return preInit.apply(null, [true, config].concat(args));
  };

  _hull = window.Hull = {
    on: createPool('on'),
    track: createPool('track'),
    ready: createPool('ready'),
    init: initMain
  };

  _hull.init.api = initApi;

  if (ENV === "client") {
    _hull.component = createPool('component');
  }

  successCb = function() {
    var args, config, context, extension, isMain, success, _config, _final;
    config = arguments[0], isMain = arguments[1], success = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
    extension = currentFlavour.success.apply(currentFlavour, args);
    context = extension.context;
    _config = _extend({}, config);
    _final = _extend({}, _hull, extension.exports, {
      ready: function(fn) {
        return fn(_final, context.me, context.app, context.org);
      }
    });
    if (isMain) {
      window.Hull = _final;
      rerun('on', _final);
      rerun('track', _final);
      if (ENV === "client") {
        rerun('component', _final);
      }
    } else {
      delete _final.component;
    }
    rerun('ready', _final);
    _final.emit('hull.init', _final, extension.context.me, extension.context.app, extension.context.org);
    success(_final, extension.context.me, extension.context.app, extension.context.org);
    return _final;
  };

  failureCb = function() {
    var args, err, isMain, userFailureFn;
    isMain = arguments[0], userFailureFn = arguments[1], err = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
    currentFlavour.failure(err);
    return userFailureFn.apply(null, [err].concat(args));
  };

  require(['flavour', 'underscore', 'lib/utils/version'], function(flavour, _, version) {
    _hull.version = version;
    _extend = _.extend;
    currentFlavour = flavour;
    return lock.unlock();
  });

}).call(this);
