console.log('Loading event');

var AWS = require('aws-sdk');
<<<<<<< HEAD
var DATA_TABLE = 'GrovePi-SBSDataTable-TOPKAL3SHIZO';
var ddb = new AWS.DynamoDB();

exports.handler = function (event, context) {
  console.log("writeSBS Data Version 1.8");
  console.log("SBSID:", event.sbsid);
=======
var DATA_TABLE = '';
var ddb = new AWS.DynamoDB();

exports.handler = function (event, context) {
>>>>>>> refs/remotes/origin/master
  console.log("Putting data into DynamoDB:", event);
  ddb.putItem({
    TableName: DATA_TABLE,
    Item: {
      sbsID: { S: event.sbsid.toString() },
<<<<<<< HEAD
      sensors: { S: JSON.stringify(event.sensors) },
=======
      sensors: { S: JSON.stringify(event.data.sensors) },
>>>>>>> refs/remotes/origin/master
      recordTimestamp: { N: Date.now().toString() }
    }
  }, function (err, data) {
    console.log(data);
    context.done(err,data);
  });
};
