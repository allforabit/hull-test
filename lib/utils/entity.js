(function() {
  define(['underscore', 'lib/utils/base64'], function(_, base64) {
    return {
      decode: function(str) {
        if (/^~[a-z0-9_\-\+\/\=]+$/i.test(str) && (str.length - 1) % 4 === 0) {
          return base64.decode(str.substr(1), true);
        } else {
          return str;
        }
      },
      encode: function(str) {
        return "~" + (base64.encode(str, true));
      }
    };
  });

}).call(this);
