/*
 * Pulls in events from various sources
 */
define(function(){

  var extension, api;

  api = function api(req, callback, errback){
    var path, url, request, headers;

    path = req.path;

    if(path[0] === '/'){
      path = path.substring(1);
    }

    url = 'http://ny.owlinteractive.com/api/'+path;

    headers = {}

    request = app.core.data.ajax({
      url: url,
      type: req.method,
      data: req_data,
      headers: headers
    });

    request.then(function(response){
      callback({ response: response, provider: 'nyarf'})
    });

  }

  extension = {
    initialize: function(app){

      app.components.before('initialize', function(options){
        if(this.addEventData){

          this.data = this.data || {};
          //this.data.events = [{title: 'test'}];

          this.data.events = new app.core.mvc.Collection([{title: 'test'}], {
            comparator: function(item){
              return item.get('title');
            }
          });

        }
      });

      app.components.after('buildContext', function(options){
        if(this.addEventData){

          //console.log('add event data');

          //fetch from nyarf
          var path, request, url, header, requestData;

          path = 'event';

          headers = {
            'Accept': 'application/javascript'
          };

          requestData = {
            field_date_value: {
              min: {
                year: 2014,
                month: 3,
                day: 19
              },
              max: {
                year: 2014,
                month: 3,
                day: 19
              },
            },
            distance: {
              latitude: 53.717856,
              longitude: -6.35609850000003,
              search_distance: 10,
              search_units: 'km'
            }
          };


          url = 'http://ny.owlinteractive.com/api/'+path;

          //fetch from nyarf
          request = app.core.data.ajax({
            url: url,
            data: requestData,
            jsonp: 'callback',
            headers: headers,
            context: this
          });

          //console.log('add event data 2');

          request.then(function(response){
            //console.log(this.data.events);

            //this.data.events.add(JSON.parse(response));
            //this.data.events = JSON.parse(response);

            _.each(JSON.parse(response), function(item){
              this.data.events.push(item);
            }, this);

          });

        }
      });


    }
  }

  return extension;


});
