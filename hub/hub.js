// var mqtt = require('mqtt')  
// var mongodb = require('mongodb');
// var mongodbClient = mongodb.MongoClient;
// var mongodbURI = 'mongodb://localhost:27017';
// 
// // Database Name
// const dbName = 'sensor-data';
// 
// mongodbClient.connect(mongodbURI, { useUnifiedTopology: true }, setupCollection);
// 
// function setupCollection(err,client) {  
//   if(err) throw err;
//   const db = client.db(dbName);
//   client = mqtt.createClient(1883,'localhost')
//   client.subscribe("#")
//   client.on('message', insertEvent);
// }
// 
// function insertEvent(topic,payload) {
//   console.log(topic + ", " + event);
// }

const MongoClient = require('mongodb').MongoClient;
const mqtt = require('mqtt')
const dotenv = require('dotenv').config()

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'sensor-data';

var collection, client;

//@attention iot-raspberrypi is the IoT platform service name in this example, you should replace it with yours
// var iotPlatformServiceName = 'data-informed-design';

// IBM IoT service
// var Client = require('ibmiotf');



// var deviceClient = new Client.IotfDevice(config);

// deviceClient.connect();
 
// deviceClient.on('connect', function () {
//   console.log("Successfully connected to our IoT service!");
// //Add your code here
// });



// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, c) {
  console.log("Connected successfully to server");

  const db = c.db(dbName);
  collection = db.collection(dbName);
  client = mqtt.connect({ host:'broker.shiftr.io', port:1883, username:process.env.USERNAME, password:process.env.PASSWORD  });
  client.subscribe('#');
  client.on('message', insertEvent);
});

const insertEvent = function(topic, payload) {
  // Get the documents collection
  // const collection = db.collection('documents');
  console.log(topic + ", " + payload);
  // deviceClient.publish("state","json",'{"d" : { "cpu" : 60, "mem" : 50 }}');
  // Insert some documents
  collection.updateOne(
    { _id: topic },
    { $push: { events: { event: { value:parseInt(payload), when:new Date() } } } },
    { upsert: true },
    function(err,docs) {
      if(err) { console.log("Insert fail"); } // Improve error handling
    }
  );
}