(function() {
  define(['promises'], function(promises) {
    return {
      deferred: promises.defer,
      when: promises.when,
      all: promises.all
    };
  });

}).call(this);
