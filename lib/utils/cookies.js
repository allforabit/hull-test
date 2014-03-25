(function() {
  define(['cookie'], function(Cookies) {
    return {
      set: Cookies.set,
      get: Cookies.get,
      remove: Cookies.expire
    };
  });

}).call(this);
