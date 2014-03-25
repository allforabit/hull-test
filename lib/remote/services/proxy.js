(function() {
  define(function() {
    return function(service, transport) {
      return (function(_this) {
        return function(req, callback, errback) {
          var path, req_data, request, url;
          path = req.path;
          if (path[0] === "/") {
            path = path.substring(1);
          }
          url = "services/" + service.path + "/" + path;
          if (req.method.toLowerCase() === 'delete') {
            req_data = JSON.stringify(req.params || {});
          } else {
            req_data = req.params;
          }
          request = transport.handle({
            url: url,
            type: req.method,
            data: req_data
          });
          request.then(function(response) {
            response.provider = service.name;
            return callback(response);
          }, errback);
        };
      })(this);
    };
  });

}).call(this);
