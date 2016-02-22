console.log('Loading event');

var AWS = require('aws-sdk');
var UNIT_TABLE = 'GrovePi-SBSUnitTable-ZM5492IW4WIM';
var ddb = new AWS.DynamoDB();

exports.handler = function (event, context) {
  console.log("writeSBS Data Version 1.1");
  console.log("SBSID:", event.sbsid);
  console.log("Putting data into DynamoDB:", event);
  ddb.putItem({
    TableName: UNIT_TABLE,
    Item: {
      sbsID: { S: event.sbsid.toString() },
    }
  }, function (err, data) {
    console.log(data);
    context.done(err,data);
  });
};
