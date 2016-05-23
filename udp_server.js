var udp = require('dgram');
var server = udp.createSocket('udp4');

module.exports = function(emitter, port) {
  server.on('error', function(err) {
    emitter.emit('error', err);
  });

  server.on('message', function(msg) {
    msg = msg.toString();

    var components = msg.split(',');

    var collection = components[0];
    if(collection == 'aggregatedata.average') {
      var deviceId = components[1].split('=')[1];
      var deviceType = components[2].split('=')[1];
      var hub = components[3].split('=')[1];
      var averageComponents = components[4].split(' ');
      var deviceStream = averageComponents[0].split('=')[1];
      var mean = averageComponents[1].split('=')[1];
      var timestamp = averageComponents[2];
      emitter.emit(collection, {hub: hub, topic: deviceType+'/'+deviceId+'/'+deviceStream, mean: mean, timestamp: timestamp});
    } else if(collection == 'deviceAverages') {
    
    } else {
    
    }
  });

  server.on('listening', function() {
    emitter.emit('listening');
  });

  server.bind(port);
}


