var net = require('net');

module.exports = function(emitter, port) {
  var server = net.createServer(function(connection) {
    connection.on('end', function() {
      emitter.emit('end');
    });

    connection.on('data', function(d) {
      emitter.emit('data', d);
    });
  });

  server.listen(port);
}


