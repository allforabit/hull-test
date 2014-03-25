(function() {
  define(['underscore'], function(_) {
    return {
      init: function(apiObject) {
        return {
          track: function(eventName, params) {
            var data;
            data = _.extend({
              url: window.location.href,
              referrer: document.referrer
            }, params);
            return apiObject.api({
              provider: "track",
              path: eventName
            }, 'post', data);
          },
          flag: function(id) {
            return apiObject.api({
              provider: "hull",
              path: [id, 'flag'].join('/')
            }, 'post');
          }
        };
      }
    };
  });

}).call(this);
