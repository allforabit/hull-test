define({
  type: 'Hull', 
  refreshEvents: ['events'],
  addEventData: true,
  templates: ['main'],
  initialize: function(){
  },
  afterRender: function(){
    console.log(this.data);
    //
    console.log(arguments);
    //
  },
  actions: {
    hello: function(evt, ctx){
      console.log('hello');
    }
  }
});
