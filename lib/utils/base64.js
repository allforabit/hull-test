(function() {
  define(function() {
    var utilsContainer;
    utilsContainer = window;
    return {
      utils: utilsContainer,
      decode: function(str) {
        return utilsContainer.decodeURIComponent(utilsContainer.escape(utilsContainer.atob(str)));
      },
      encode: function(str) {
        return utilsContainer.btoa(utilsContainer.unescape(utilsContainer.encodeURIComponent(str)));
      },
      utilsContainer: window
    };
  });

}).call(this);
