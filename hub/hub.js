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

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'sensor-data';

var collection, client;

// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, c) {
  console.log("Connected successfully to server");

  const db = c.db(dbName);
  collection = db.collection(dbName);
  client = mqtt.connect({ host:'localhost', port:1883 });
  client.subscribe('#');
  client.on('message', insertEvent);
});

const insertEvent = function(topic, payload) {
  // Get the documents collection
  // const collection = db.collection('documents');
  console.log(topic + ", " + payload);
  // Insert some documents
  collection.updateOne(
    { _id: "arduino" },
    { $push: { events: { event: { value:payload, when:new Date() } } } },
    { upsert: true },
    function(err,docs) {
      if(err) { console.log("Insert fail"); } // Improve error handling
    }
  );
}