#Link Realtime Analytics Results API

API component for the realtime analytics PoC for Apigee Link.

## Building for docker

```
./build.sh
```

##API

## Workflow structure

### Subscribe to all real time aggregations

1. GET request against root URL
2. UPGRADE request against url with rel `events`
3. Handle open websocket. Read only with events

### Query aggregation

1. GET request against root URL
2. GET request with url provided by the `query` action
  * input: topic -> Specific topic for retrieving aggregations for
  * input: aggregation -> Type of aggregation to look up
  * input: field -> field to aggregate on
  * input: groupBy -> What to group the aggregation on. Hardcoded to the topic of the events for PoC **NOTE** This could be a WHERE clause as well. This is for different levels of desired aggregation.
3. Response contains last 5 minutes of aggregations, and websocket to stream more aggregations as they happen. 

### Subscribe to aggregation

1. Perform the steps in Query Aggregation
2. UPGRADE request against url with rel `events`
3. Handle open websocket. Read only with events
 
## Responses

### GET root

```json
{
  "class":["root"],
  "actions":[
    {
      "name": "query",
      "href": "http://<HOST>/",
      "method": "GET",
      "type": "application/x-www-form-urlencoded",
      "fields": [
        {
          "name": "topic",
          "type": "text"  
        },
        {
          "name": "field",
          "type": "text"  
        },
        {
          "name": "aggregation",
          "value": [
            {
              "value": "average"
            },
            {
              "value": "sum"
            }
          ]
        },
        {
          "name":"groupBy",
          "type":"hidden",
          "value":"topic"
        }
      ]
    }
  ],
  "links":[
    {
      "rel": ["self"],
      "href": "http://<HOST>/"  
    },
    {
      "rel": ["http://<REL_HOST>/events"],
      "href": "ws://<HOST>/events"  
    }
  ]
}
```

### Query response

```json
{
  "class":["query-result"],
  "properties": {
    "topic": "foo/1/foo",
    "field": "data",
    "aggregation": "average",
    "groupedBy": "topic",
    "timestamp": 0  
  },
  "entities": [
    {
      "class": ["aggregation"],
      "rel": ["item"],
      "properties": {
        "value": 1,
        "deviceId": 1,
        "timestamp": 0  
      }  
    },
    {
      "class": ["aggregation"],
      "rel": ["item"],
      "properties": {
        "value": 1,
        "deviceId": 1,
        "timestamp": 0  
      }  
    },
    {
      "class": ["aggregation"],
      "rel": ["item"],
      "properties": {
        "value": 1,
        "deviceId": 1,
        "timestamp": 0  
      }  
    },
    {
      "class": ["aggregation"],
      "rel": ["item"],
      "properties": {
        "value": 1,
        "deviceId": 1,
        "timestamp": 0  
      }  
    },
    {
      "class": ["aggregation"],
      "rel": ["item"],
      "properties": {
        "value": 1,
        "deviceId": 1,
        "timestamp": 0  
      }  
    },
  ],
  "links": [
    {
      "rel": ["self"],
      "href": "http://<HOST>/?topic=foo%2F1%2F&aggregation=average&field=data"  
    },
    {
      "rel": ["up"],
      "href": "http://<HOST>/"  
    }
    {
      "rel": ["http://<REL_HOST>/events"],
      "href": "ws://<HOST>/events?topic=foo%2F1%2F&aggregation=average&field=data"  
    } 
  ]  
}
```

## Disclaimer

This is not an officially supported Google product.
