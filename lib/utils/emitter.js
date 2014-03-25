(function() {
  var methods;

  methods = ['on', 'onAny', 'offAny', 'once', 'many', 'off', 'removeAllListeners', 'listeners', 'listenersAny', 'emit', 'setMaxListeners'];

  define(['underscore', 'eventemitter'], function(_, EventEmitter2) {
    return function() {
      var ee, method, _ee, _i, _len;
      _ee = new EventEmitter2({
        wildcard: true,
        delimiter: '.',
        newListener: false,
        maxListeners: 100
      });
      ee = {};
      for (_i = 0, _len = methods.length; _i < _len; _i++) {
        method = methods[_i];
        ee[method] = _.bind(_ee[method], _ee);
      }
      return ee;
    };
  });

}).call(this);
