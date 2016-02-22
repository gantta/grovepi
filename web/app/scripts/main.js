/* global TimeSeries */
/* global SmoothieChart */
/* global async */
/* global $ */
/**
* GrovePi | FRONT END CODE
* This code uses AWS API Gateway to query DynamoDB and get the latest sensor data produced
* by the GrovePi compute unit.

Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Note: Other license terms may apply to certain, identified software files contained within or
distributed with the accompanying software if such terms are included in the directory containing
the accompanying software. Such other license terms will then apply in lieu of the terms of the
software license above.

* Constants to change
* -------------------------------------------------------
* SBS_ENDPOINT: The location of your SBS endpoint.
* POLL_INTERVAL: How often you want to run the AJAX query.
* --------------------------------------------------------
*/
'use strict';

/* CONSTANTS */
// ============ CHANGE THESE VALUES BELOW =============== //

var SBS_ENDPOINT = 'https://mdn3e2b7y4.execute-api.us-east-1.amazonaws.com/test/';
var POLL_INTERVAL = 1000;

// ============ REST OF CODE =============== //

// Smoothie Settings
var MILLIS_PER_PIXEL = 50;
var MAX_VAL_SCALE = 3.0;
var MIN_VAL_SCALE = 3.0;
var LINE_WIDTH = 1;
var MILLIS_PER_LINE = 400;
var VERTICAL_SECTIONS = 6;
var SMOOTHIE_SPEED = 1000;

// The SBS Units that are displayed on this page.
// { SBSID: { sound: Timeseries object, temp: Timeseries object,  recordTimestamp: Last timestamp since data was updated. } };
var sbsUnits = {};

// Smoothie Chart objects for flow and sound sensor data.
var temp = null, sound = null;

// Default colour scheme for the smoothie graph.
var colors = {
    chartgray: {
        stroke: 'rgb(60, 60, 60)',
        fill: 'rgb(30, 30, 30)'
    }
};

// Current timestamp
var timestamp = new Date().getTime();

/* FUNCTIONS */

/**
 * Converts an RBG color array [R,G,B] to a css style.
 */
function colorToStyle(color, alpha) {
   return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')';
}

/**
 * Create a new SmootheChart object based on the defined characteristics in the CONSTANTS section.
 * @param sensor {string} Name of the sensor.
 */
function createTimeSeriesGraph(sensor) {
    var smoothie = new SmoothieChart({ millisPerPixel: MILLIS_PER_PIXEL, maxValueScale: MAX_VAL_SCALE, minValueScale: MIN_VAL_SCALE, grid: { strokeStyle: colors.chartgray.stroke, fillStyle: colors.chartgray.fill, lineWidth: LINE_WIDTH, millisPerLine: MILLIS_PER_LINE, verticalSections: VERTICAL_SECTIONS } });
    smoothie.streamTo(document.getElementById(sensor), SMOOTHIE_SPEED);
    return smoothie;
}

/**
 * This function adds a new SBS unit to the SBS dictionary. It initializes the timeseries objects in each object.
 * @param {string} sbsID The identifier for the SBS unit
 * @param {Function} callback The callback funciton.
 */
 function addSBSUnit(sbsID, callback) {
   $.ajax({
     dataType: 'json',
     type: 'GET',
     url: SBS_ENDPOINT + sbsID,
     success: function(data) {
       console.log('Creating graph');
       var info = data[sbsID];
       if (sbsUnits[sbsID] === undefined) {
         sbsUnits[sbsID] = { 'temp': new TimeSeries(), 'sound': new TimeSeries(), 'timestamp': new Date().getTime()};
         temp.addTimeSeries(sbsUnits[sbsID].temp, { strokeStyle: colorToStyle(info.color, 1), fillStyle: colorToStyle(info.color, 0.4), lineWidth: 3 });
         sound.addTimeSeries(sbsUnits[sbsID].sound, { strokeStyle: colorToStyle(info.color, 1), fillStyle: colorToStyle(info.color, 0.4), lineWidth: 3 });
         $('#legend').append('<div id="legend-' + sbsID + '" class="legend-row">' +
                '<div class="colorblock" style="background:' + colorToStyle(info.color, 1) + ';"><div class="short">' + info.short + '</div></div>' +
                '<div class="location"><span class="placeholder-title">' + sbsID + '</span>' + info.full + '</div>' +
                '<div class="dht"><div class="temp"><span class="placeholder-title">TEMP</span><span class="value"></span></div>' +
                //'<div class="humidity"><span class="placeholder-title">HUMIDITY</span><span class="value"></span></div>' +
                '</div></div>');
        }
        callback(null, null);
     },
     error: function(xhr) {
        console.error('Could not get SBS Unit Information: | ' + xhr);
        callback(xhr, null);
     }
   });
}

/**
 * Updates the Smoothie graph with the latest timeseries data.
 * @param {string} sbsID The identifier for the SBS unit
 * @param {JSON} values The values returned from the API Gateway request.
 */
function update(sbsID, values) {

    console.log(sbsID, values);

    if (sbsID === undefined || values === undefined) {
      console.error('No data.');
      return;
    }

    async.series([
      /**
      function(callback) {
        // First, add the unit if it is not already being displayed.
        if (sbsUnits[sbsID] === undefined) {
           addSBSUnit(sbsID, callback);
        } else {
          callback(null, null);
        }
      },
      */
      function(callback) {
        // First, add the unit if it is not already being displayed.
        if (sbsUnits[sbsID] === undefined) {
           addSBSUnit(sbsID, callback);
        } else {
          callback(null, null);
        }
        // Next, add the values for the sensors.
        if (values.temp !== undefined) {
            console.log('Temp: ', values.temp);
            sbsUnits[sbsID].temp.append(Date.now(), values.temp);
        }
        if (values.sound !== undefined) {
            console.log('Sound: ', values.sound);
            sbsUnits[sbsID].sound.append(Date.now(), values.sound);
        }
        if (values.temp) {
            $('"#legend-' + sbsID + ' .temp .value"').html(values.temp + '°C');
        }
        /**
        if (values.humidity) {
            $("#legend-" + sbsID + " .humidity .value").html(values.humidity + "%");
        }
        */
      }
    ]);
}

  /**
   * Refreshes the data on the graph.
   */
function refresh() {

   $.ajax({
     dataType: 'json',
     url: SBS_ENDPOINT + 'data',
     data: {'timestamp': timestamp},
     async: true,
     success: function(response) {
       if (typeof response !== 'object') {
         response = JSON.parse(response);
       }
       // Set the timestamp to timestamp of the response. Last successful query.
       timestamp = response.timestamp;

       if ($.isEmptyObject(response)) {
         console.log('Empty object');
       } else {
         console.log('Not an empty object. Found Something!');
         for (var key in response.records) {
           if (response.records.hasOwnProperty(key)) {
             // Update the smoothie graph.
             console.log('SBS: ' + response.records[key].sbsID.S);
             console.log('Sensor: ' + JSON.parse(response.records[key].sensors.S));
             update(response.records[key].sbsID.S, JSON.parse(response.records[key].sensors.S));
           }
         }

      }
     },
     error: function(xhr) {
         console.error('Could not get record data: | ' + xhr);
         return null;
     }
   });
}


/* On page load, init Smoothie graphs */

$( document ).ready(function() {
  temp = createTimeSeriesGraph('temp');
  sound = createTimeSeriesGraph('sound');
  setInterval(function() {
       refresh();
  }, POLL_INTERVAL);
});
