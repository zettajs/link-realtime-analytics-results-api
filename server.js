var argo = require('argo');
var router = require('argo-url-router');
var urlHelper = require('argo-url-helper');
var resource = require('argo-resource');
var root = require('./root');
var TcpReceiver = require('./tcp_receiver');
var InfluxLineParser = require('./influx_line_parser');
var http = require('http');
var qs = require('querystring');
var url = require('url');
var EventEmitter = require('events').EventEmitter;

var ws = require('ws');
var wss = ws.Server;

var socketServer = new wss({noServer: true});

var topics = {};

var server = http.createServer();

var argoServer = argo()
  .use(router)
  .use(urlHelper())
  .use(resource(root))

argoServer = argoServer.build();
server.on('request', argoServer.run);

server.on('upgrade', function(request, socket, headers) {
  var singleStreamPattern = /^\/events\?.+$/;
  var globalEventStream = /^\/events$/;
  if(singleStreamPattern.test(request.url)) {
    socketServer.handleUpgrade(request, socket, headers, function(ws) {
      var queryString = url.parse(ws.upgradeReq.url).query;
      var query = qs.parse(queryString);  
      var topic = query.topic;
      console.log(topic, ' ', typeof topic);
      if(topics[topic]) {
        var socketArray = topics[topic];
        socketArray.push(ws);     
      } else {
        topics[topic] = [ws];
      }

      ws.on('close', function() {
        delete topics[topic];
      });
    });
  } else if(globalEventStream.test(request.url)) {
    socketServer.handleUpgrade(request, socket, headers, function(ws) {
      var topic = '*';
      if(topics[topic]) {
        var socketArray = topics[topic];
        socketArray.push(ws);     
      } else {
        topics[topic] = [ws];
      }
      ws.on('close', function() {
        delete topics['*'];
      });
    });
  }

  
});
var emitter = new EventEmitter();
emitter.on('data', function(data) {
  data = data.toString().split('\n');
  data.forEach(function(dataLine) {
    parseAndSend(dataLine);
  });

  function parseAndSend(line) {
    var parsedData = InfluxLineParser(line);
    if(parsedData) {
      console.log(parsedData);
      
      var data = parsedData.data;
      if(topics[data.topic]) {
        var sockets = topics[data.topic];
        sockets.forEach(function(socket) {
          socket.send(JSON.stringify(data));
        });
      }

      if(topics['*']) {
        var sockets = topics['*'];
        sockets.forEach(function(socket) {
          socket.send(JSON.stringify(data));
        });
      }
    }
  }
  
});
TcpReceiver(emitter, process.env.TCP_PORT || 3008);
server.listen(process.env.PORT || 3002);

