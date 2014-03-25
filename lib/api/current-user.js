(function() {
  define(function() {
    return function(emitter) {
      var _currentUser;
      _currentUser = false;
      emitter.on('hull.init', function(hull, me, app, org) {
        return _currentUser = me;
      });
      emitter.on('hull.auth.login', function(me) {
        return _currentUser = me;
      });
      emitter.on('hull.auth.logout', function() {
        return _currentUser = false;
      });
      return function() {
        return _currentUser;
      };
    };
  });

}).call(this);
