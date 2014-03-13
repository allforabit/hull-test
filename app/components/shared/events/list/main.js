define({
  //type: 'Rivets',
  templates: ['main'],
  initialize: function(){

    this.html('hello:');

    console.log(this.sandbox);

    var loc = new google.maps.LatLng(this.sandbox.loc.coords.latitude, this.sandbox.loc.coords.longitude);

    this.$el.css({width: '100%', height: '500px'});

    this.map = new google.maps.Map(this.sandbox.el, {
        center: loc,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    google.maps.event.addListener(this.map, "click", function(event) {
      var lat = event.latLng.lat();
      var lng = event.latLng.lng();
      _this.trigger('clicked', event.latLng);
    });

  }

});
