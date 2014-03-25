(function() {
  define(function() {
    return {
      login: function(model, mediator, attributes) {
        if (attributes == null) {
          attributes = {};
        }
        if (!model) {
          return;
        }
        attributes._id = 'me';
        model('me').clear({
          silent: true
        });
        return model('me').set(attributes);
      },
      logout: function(model, mediator) {
        if (!model) {
          return;
        }
        model('me').clear();
        return model('me').set({
          _id: 'me'
        }, {
          silent: true
        });
      }
    };
  });

}).call(this);
