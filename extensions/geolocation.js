define(function(){

  var api;

  var success = function success(app, p){
    app.sandbox.loc = p;
  }

  var error = function error(app, e){
    console.log(e);
  }

  api = {
    initialize: function(app) {
      if(geoPosition.init()){  // Geolocation Initialisation
        var loc = app.core.data.deferred();

        geoPosition.getCurrentPosition(function(p){
            app.sandbox.loc = p;
            loc.resolve();
          },
          function(){
            loc.resolve();
          },
          {enableHighAccuracy:true});

        return loc.promise();

      }
    }
  }

  return api;

});

/*
//var currentLocation;
var currentLocation = {
  distance: 10,
  latitude: 53.717856000000000000,
  longitude: -6.356098500000030000
};

var currentGeoPosition;

var getCurrentGeoposition = function(){
  if(currentGeoPosition){
    return currentGeoPosition;
  }else{
    if (geoPosition.init()) {
      var dfd = $.Deferred();
    }else{
      return null;
    }
  }
}
*/


