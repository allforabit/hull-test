(function() {
  define(function() {
    var UserManager;
    UserManager = (function() {
      function UserManager(userDesc, userCreds, updater) {
        if (userDesc == null) {
          userDesc = null;
        }
        if (userCreds == null) {
          userCreds = {};
        }
        this.currentUser = userDesc;
        this.currentSettings = userCreds;
        this.updater = updater;
      }

      UserManager.prototype.loggedIn = function() {
        return this.currentUser != null;
      };

      UserManager.prototype.is = function(userId) {
        var _ref;
        return ((_ref = this.currentUser) != null ? _ref.id : void 0) === userId;
      };

      UserManager.prototype.updateDescription = function() {
        return this.updater.handle({
          url: 'me',
          nocallback: true
        });
      };

      UserManager.prototype.updateSettings = function() {
        return this.updater.handle({
          url: 'app/settings',
          nocallback: true
        });
      };

      return UserManager;

    })();
    return {
      initialize: function(app) {
        var userManager;
        userManager = new UserManager(app.config.data.me, app.config.settings, app.core.handler);
        app.core.handler.after(function(h) {
          var p1, p2, userId;
          userId = h.headers['Hull-User-Id'];
          if (!userManager.is(userId)) {
            delete app.core.handler.headers['Hull-Access-Token'];
            p1 = userManager.updateDescription().then(function(h) {
              userManager.currentUser = h.response;
              return app.sandbox.emit('remote.user.update', h.response);
            }, function(err) {
              userManager.currentUser = {};
              return app.sandbox.emit('remote.user.update', {});
            });
            p2 = p1.then(userManager.updateSettings().then(function(h) {
              userManager.currentSettings = h.response;
              return app.sandbox.emit('remote.settings.update', h.response);
            }, function(err) {
              userManager.currentSettings = {};
              return app.sandbox.emit('remote.settings.update', {});
            }));
            return p2;
          }
        });
        app.core.currentUser = function() {
          return JSON.parse(JSON.stringify(userManager.userDesc));
        };
        return app.core.settings = function() {
          return JSON.parse(JSON.stringify(userManager.currentSettings));
        };
      }
    };
  });

}).call(this);
