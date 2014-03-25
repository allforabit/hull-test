define({
  type: 'Hull',
  templates: ['map'],
  initialize: function(){

    this.html('hello');

    var loc = new google.maps.LatLng(this.sandbox.loc.coords.latitude, this.sandbox.loc.coords.longitude);

    this.$el.css({width: '100%', height: '300px'});

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

/*
Nyarf.module("Components.Map", function(Map, App, Backbone, Marionette, $, _){

  Map.Default = App.Views.ItemView.extend({
    className: 'map',
    template: function(data){
      return '';
    },
    initialize: function(options){
      this.latLng = options.latLng;
      if(options.markerTitle){
        this.markerTitle = options.markerTitle;
      }
    },
    setMarker: function(latLng, title){
      if(this.marker){
        this.marker.setMap(null);
      }
      this.marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        title: title 
      });

      this.map.panTo(this.marker.getPosition());
    },
    onRender: function(){
      _this = this;

      this.$el.css({width: '100%', height: '250px'});

      this.map = new google.maps.Map(this.el, {
          center: this.latLng,
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      if(this.markerTitle){
        this.setMarker(this.latLng, this.markerTitle);
      }

      google.maps.event.addListener(this.map, "click", function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        _this.trigger('clicked', event.latLng);
      });

    }
  });

  Map.Image = App.Views.ItemView.extend({
    className: 'map-image',
    template: '#map-image',
    triggers: {
      'click a': 'map:clicked'
    },
    onMapClick: function(evt){
      evt.preventDefault();
      this.trigger('map:clicked');
    },
    initialize: function(options){
      this.latLng = options.latLng;
      if(options.zoom){
        this.zoom = options.zoom;
      }
    },
    serializeData: function(){
      var data = this.model.toJSON();
      data.width = $(document).width();
      data.width = $(document).width();
      data.zoom = this.zoom || 17;
      return data;
    }
  });

  Map.StreetView = App.Views.ItemView.extend({
    className: 'map',
    template: function(data){
      return '';
    },
    initialize: function(options){
      this.latLng = options.latLng;
      if(options.map){
        this.map = options.map;
      }
    },
    onRender: function(){
      var panoramaOptions = {
        position: this.latLng,
        pov: {
          heading: 34,
          pitch: 10
        }
      };
      var panorama = new google.maps.StreetViewPanorama(this.el, panoramaOptions);
      if(this.map){
        this.map.setStreetView(panorama);
      }
    }
  });

  Map.StreetViewImage = App.Views.ItemView.extend({
    className: 'map-image',
    template: '#street-view-image',
    initialize: function(options){
      this.latLng = options.latLng;
    },
    triggers: {
      'click a': 'map:clicked'
    },
    serializeData: function(){
      var data = this.model.toJSON();
      data.width = $(document).width();
      return data;
    }
  });

});*/
