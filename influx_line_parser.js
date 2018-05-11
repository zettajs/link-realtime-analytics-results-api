// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = function(line) {
  var components = line.split(',');
  console.log(components);

  if(components.length && components[0]) {
    var collection = components[0];
    var aggregation = collection.split('.')[1];
    var deviceId = components[1].split('=')[1];
    var deviceType = components[2].split('=')[1];
    var hub = components[3].split('=')[1];
    var averageComponents = components[4].split(' ');
    var deviceStream = averageComponents[0].split('=')[1];
    var value = averageComponents[1].split('=')[1];
    var timestamp = parseInt(averageComponents[2]) / 1000000;
    var data = {hub: hub, topic: deviceType+'/'+deviceId+'/'+deviceStream, value: parseFloat(value), timestamp: timestamp, aggregation: aggregation};
    return {collection: collection, data: data};
  } else {
    return null;
  }
}
