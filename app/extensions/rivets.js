define({
  require: {
    paths: {
      rivets: 'bower_components/rivets/dist/rivets'
    }
  },
  initialize: function(app){

    var rivets = require('rivets');

    rivets.adapters[':'] = {
      subscribe: function(obj, keypath, callback) {
        if(obj instanceof app.core.mvc.Collection && keypath === 'models') {
          obj.on("add remove", function() { 
            callback(obj.models);
          });
        } else {
          obj.on("change:" + keypath, function(m, v) {
            callback(v);
          });
        }
      },
      unsubscribe: function(obj, keypath, callback) {
        console.log(obj);
        if(obj instanceof app.core.mvc.Collection && keypath === 'models') {
          obj.off("add remove", callback);
        } else {
          obj.off("change:" + keypath, callback);
        }
      },
      read: function(obj, keypath) {
        if(obj instanceof app.core.mvc.Collection && keypath === 'models') {
          return obj.models;
        }else{
          return obj.get(keypath);
        }
      },
      publish: function(obj, keypath, value) {
        obj.set(keypath, value)
      }
    };

    rivets.configure({
      handler: function(target, event, binding) {
        console.log(arguments);
      }
    });

    app.components.after('doRender', function(){

      var _this = this;
      this.rivetsTemplate = rivets.bind(this.el, _this.data);

      var rivetsEachRoutine = this.rivetsTemplate.binders['each-*'].routine;

      this.rivetsTemplate.binders['each-*'].routine = function(el, collection){
        rivetsEachRoutine.apply(this, arguments);
        _.defer(function() {
          _this.sandbox.start(el);
        });

      }

    });

  }
});
