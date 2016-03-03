/*
Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Note: Other license terms may apply to certain, identified software files contained within or
distributed with the accompanying software if such terms are included in the directory containing
the accompanying software. Such other license terms will then apply in lieu of the terms of the
software license above.
*/
<<<<<<< HEAD
console.log('Loading event v1.1');

var DATA_TABLE = 'GrovePi-SBSDataTable-TOPKAL3SHIZO';
var UNIT_TABLE = 'GrovePi-SBSUnitTable-ZM5492IW4WIM';
=======
console.log('Loading event');

var DATA_TABLE = '';
var UNIT_TABLE = '';
>>>>>>> refs/remotes/origin/master
var AWS = require("aws-sdk");

var ddb = new AWS.DynamoDB();
var async = require("async");

console.log('Loading function');

function getData(time, records, callback) {

	if (records.length == 0) {
		callback(null, "No SBS units.");
	}

	var cache = [];

	async.map(records, function(record, inner_callback) {
		console.log("Collecting records for... ", record.sbsID.S.toString(), "at time:", time);
		var params = {
			TableName: DATA_TABLE,
			Limit:10,
			Select: 'SPECIFIC_ATTRIBUTES',
			AttributesToGet: ['recordTimestamp','sensors','sbsID'],
			KeyConditions: {
				sbsID: {
					ComparisonOperator: 'EQ',
					AttributeValueList: [record.sbsID]
				},
				recordTimestamp: {
					ComparisonOperator: 'GE',
					AttributeValueList: [{
						N: time
					}]
				}
			}
		};

		ddb.query(params, function(err, data) {
			if (err) {
				console.log(err);
				callback(err, "Error...");
			}
			else {
<<<<<<< HEAD
				console.log(this.data.Items)
				console.log(record.sbsID.S);
=======
				//console.log(this.data.Items)
				//console.log(record.sbsID.S);
>>>>>>> refs/remotes/origin/master
				cache = cache.concat(this.data.Items);
				inner_callback(err, null);

			}
		});
	}, function(err, results) {
		callback(err, cache);
	});

}

exports.handler = function(event, context) {

	var time = (new Date().getTime()-10000).toString();
	if ((event.timestamp!==undefined)&&(event.timestamp)) {
		time = event.timestamp;
	}

	var response = new Object();

	async.waterfall([
		function(callback) {
<<<<<<< HEAD
			console.log("Fetching SBS units. v2");
=======
			console.log("Fetching SBS units.");
>>>>>>> refs/remotes/origin/master
			var params = {
				TableName: UNIT_TABLE,
				Limit:50,
				AttributesToGet: ['sbsID']
			};
			ddb.scan(params, function(err, data) {
				if (err) {
					console.log("There was an error.");
					context.fail("Could not get SBS unit data.");
				} else {
					callback(null, this.data.Items)
				}
			})
		},
		function(items, callback) {
<<<<<<< HEAD
			console.log('Items Retrieved: ',items);
			getData(time, items, callback);
			console.log("Back from loop.");
		},
		function(cache, callback) {
			console.log(cache);
=======
			//console.log('Items: ',items);
			getData(time, items, callback);
			//console.log("Back from loop.");
		},
		function(cache, callback) {
			//console.log(cache);
>>>>>>> refs/remotes/origin/master
			response.records = cache
			response.timestamp = new Date().getTime();
			context.succeed(response);
		}
	]);

};
