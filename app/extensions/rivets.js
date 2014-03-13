define({
  require: {
    paths: {
      rivets: 'bower_components/rivets/dist/rivets'
    }
  },
  initialize: function(app){
    console.log(app);

    var rivets = require('rivets');

    app.components.after('initialize', function(){
      rivets.bind(this.options.el, this.data)
    });

    app.components.after('remove', function(){
      //tidy up
    });
    
  },
  afterAppStart: function(app){

  }
});
