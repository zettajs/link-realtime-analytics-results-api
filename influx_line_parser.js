module.exports = function(line) {
  var components = line.split(',');

  var collection = components[0];
  if(collection == 'aggregatedata.average') {
    var deviceId = components[1].split('=')[1];
    var deviceType = components[2].split('=')[1];
    var hub = components[3].split('=')[1];
    var averageComponents = components[4].split(' ');
    var deviceStream = averageComponents[0].split('=')[1];
    var mean = averageComponents[1].split('=')[1];
    var timestamp = parseInt(averageComponents[2]) / 1000000;
    var data = {hub: hub, topic: deviceType+'/'+deviceId+'/'+deviceStream, mean: mean, timestamp: timestamp};
    return {collection: collection, data: data};
  } else if(collection == 'deviceAverages') {
  
  } else {
    return null; 
  }
}
