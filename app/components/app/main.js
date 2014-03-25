define({
  type: 'Hull',
  templates: ['app'],
  datasources: {
    events: '/app/entities'
  },
  actions: {
    dump: function(evt, ctx){
      console.log(ctx.data.events.toJSON()[0]);
    }
  },
  afterRender: function(data){
  },
  initialize: function(){

  }
});
