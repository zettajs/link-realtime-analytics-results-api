var url = require('url');
var MediaType = require('api-media-type');
var InfluxQueryClient = require('./influx_query_client');

var Root = module.exports = function() {
  this.path = '/';
}

Root.prototype.init = function(config) {
  this._client = new InfluxQueryClient();
  this._client.on('ready', function() {
    console.log('ready');
  });
  config
    .path(this.path)
    .produces(MediaType.SIREN)
    .consumes(MediaType.FORM_URLENCODED)
    .get('/', this.root);
}

Root.prototype.root = function(env, next) {
  var self = this;
  var params = env.route.query;
  var topic = params.topic;

  if(topic) {
    var field = params.field;
    var aggregation = params.aggregation;

    if(!field || !aggregation) {
      env.response.statusCode = 404;
      return next(env);
    }

    self._client.getFiveLatestEvents(aggregation, topic, function(err, results) {
      if(err) {
        env.response.statusCode = 500;
        return next(env);
      }

      self._buildResponse(results, env, next);
    });

  } else {
    this._rootResponse(env, next);
  }


}


Root.prototype._rootResponse = function(env, next) {
  var res = {
    class: ['root'],
    actions: [
      {
        name: 'query',
        href: env.helpers.url.current(),
        method: 'GET',
        type: MediaType.FORM_URLENCODED,
        fields: [
          {
            "name":"topic",
            "type": "text"
          },
          {
            "name": "field",
            "type": "text"
          },
          {
            "name": "aggregation",
            "type": "radio",
            "value": [
              {
                "value":"average"
              },
              {
                "value": "min"
              },
              {
                "value": "max"
              },
              {
                "value": "raw"
              }
            ]
          }
        ]
      }
    ],
    links: [
      {
        rel: ['self'],
        href: env.helpers.url.current()
      },
      {
        rel: ['events'],
        href: env.helpers.url.path('/events').replace(/^http/, 'ws')
      }
    ]
  }
  env.response.statusCode = 200;
  env.response.body = res;
  next(env);
};

Root.prototype._buildResponse = function(results, env, next) {
  var params = env.route.query;
  var topic = params.topic;
  var q = {topic: params.topic};
  var field = params.field;
  var aggregation = params.aggregation;

  function formatEntity(item) {
    var value = item[aggregation];
    if(aggregation == 'average') {
     value = item['mean'];
    } else if (aggregation == 'raw') {
     value = item['value'];
    }

    return {
      "rel": ["item"],
      "class": ["aggregation"],
      "properties": {
        "device": item.device,
        "value": value,
        "timestamp": item.time
      }
    };
  }

  var entities = [];
  if(results.length) {
    entities = results[0].results.map(function(i) {
      return formatEntity(i);
    });
  } 
  var res = {
      class: ['query-results'],
      properties: {
        topic: params.topic,
        field: field,
        aggregation: aggregation,
        timestamp: Date.now()
      },
      entities: entities,
      links: [
        {
          rel: ['self'],
          href: env.helpers.url.current()
        },
        {
          rel: ['up'],
          href: env.helpers.url.path('/')
        },
        {
          rel: ['monitor'],
          href: env.helpers.url.path('/events') + url.format({query: q})
        }
      ]
    }

  env.response.body = res;
  env.response.statusCode = 200;
  next(env);
}
