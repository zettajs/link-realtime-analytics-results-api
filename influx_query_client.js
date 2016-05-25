var InfluxNodeClient = require('./influx_node_client');
var InfluxBasicClient = require('./influx_basic_client');
var url = require('url');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var InfluxQueryClient = module.exports = function() {
  EventEmitter.call(this);
  var self = this;
  var connected = false;
  var opts = {
    host: process.env.COREOS_PRIVATE_IPV4 
  };

  if(process.env.ETCD_PEER_HOSTS) {
    opts.host = process.env.ETCD_PEER_HOSTS.split(',');
  }

  this._nodeClient = new InfluxNodeClient(opts);
  self._nodeClient.findAll(function(err, results) {
    console.log(arguments);
    if(err) {
      return console.error(err);
    }

    if(results.length) {
      var endpoint = results[0].url;
      console.log('Connecting to influx endpoint: ', endpoint);
      var endpointUrl = url.parse(endpoint);
      self._clientCredentials = {
        hostname:endpointUrl.hostname,
        port:endpointUrl.port,
        database:'deviceData'
      };
      self.emit('ready');
    }

    self._nodeClient.on('change', function(results) {
      if(results.length) {
        var endpoint = results[0].url;
        console.log('Connecting to influx endpoint: ', endpoint);
        var endpointUrl = url.parse(endpoint);
        self._clientCredentials = {
          hostname:endpointUrl.hostname,
          port:endpointUrl.port,
          database:'deviceData'
        };
      }
    });
  }); 
}
util.inherits(InfluxQueryClient, EventEmitter);

InfluxQueryClient.prototype.getFiveLatestEvents = function(aggregate, topic, cb) {
  var current = new Date();
  var timestamp = new Date(current.setSeconds(0));
  var topicComponents = topic.split('/');
  var type = topicComponents[0]; 
  var id = topicComponents[1];
  var stream = topicComponents[2];
  var series = 'devicedata.'+type+'.'+stream;

  if(aggregate == 'average') {
    series = 'aggregatedata.average'; 
  } 
  series = '"' + series + '"';
  var creds = this._clientCredentials;
  var query = "SELECT mean as value, * FROM "+ series +" WHERE time < '" + timestamp.toISOString() + "' AND device = '" + id + "' ORDER BY time DESC LIMIT 5";
  console.log(query);
  if(aggregate == 'raw') {
    query = "SELECT * FROM "+ series +" WHERE device = '" + id + "' ORDER BY time DESC LIMIT 5";
  }   
  InfluxBasicClient.query(creds.hostname, creds.port, creds.database, query, function(err, results) {
    if(err) {
      return cb(err);
    }

    return cb(null, results);
  });
};
