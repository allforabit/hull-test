(function() {
  define(['jquery'], function($) {
    return function(qPromise) {
      var $dfd;
      $dfd = $.Deferred();
      qPromise.then($dfd.resolve, $dfd.reject);
      return $dfd.promise();
    };
  });


}).call(this);
