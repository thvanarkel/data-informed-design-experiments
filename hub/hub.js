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

// const MongoClient = require('mongodb').MongoClient;
const mqtt = require('mqtt')
const dotenv = require('dotenv').config()
const path = require('path')
const fs = require('fs')
const csv = require('fast-csv')

const directory = process.env['HOME'] + '/sensor-data';

class Thing {
  static write(filestream, rows, options) {
    return new Promise((res, rej) => {
        csv.writeToStream(filestream, rows, options)
            .on('error', err => rej(err))
            .on('finish', () => res());
    });
  }

  constructor(opts) {
    this.headers = opts.headers;
    this.path = opts.path;
    this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true, rowDelimiter:"\n", quoteColumns: true };
    this.name = opts.name;
    this.created = fs.existsSync(opts.path)
  }

  create(rows) {
    return Thing.write(fs.createWriteStream(this.path), rows, { ...this.writeOpts })
              .then(() => this.created = fs.existsSync(this.path));
  }

  append(rows) {
    return Thing.write(fs.createWriteStream(this.path, { flags: 'a' }), rows, {
        ...this.writeOpts,
        writeHeaders: false,
    });
  }

  read() {
    return new Promise((res, rej) => {
        fs.readFile(this.path, (err, contents) => {
            if (err) {
                return rej(err);
            }
            return res(contents);
        });
    });
  }
}

// Connection URL
// const url = 'mongodb://localhost:27017';

// Database Name
// const dbName = 'sensor-data';

// var collection, client;

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

var things = [];

let thingName = "sensor";


const file = new Thing({
    path: path.resolve(directory, thingName + '.csv'),
    // headers to write
    headers: ['stream', 'timestamp', 'value'],
    name: thingName
});

if (file.created) {
  file.create([
    {}
  ])
}

// file.read()
//   .then(contents => {
//     console.log(`${contents}`);
//   })
  


    //     csvFile.append([
    //         { a: 'a4', b: 'b4', c: 'c4' },
    //         { a: 'a5', b: 'b5', c: 'c5' },
    //     ])
    // 
    // // append another row
    // .then(() => csvFile.append([{ a: 'a6', b: 'b6', c: 'c6' }]))
    // .then(() => csvFile.read())
    // .then(contents => {
    //     console.log(`${contents}`);
    // })
    // .catch(err => {
    //     console.error(err.stack);
    //     process.exit(1);
    // });

// // Use connect method to connect to the server
// MongoClient.connect(url, { useUnifiedTopology: true }, function(err, c) {
//   console.log("Connected successfully to server");
// 
//   const db = c.db(dbName);
//   collection = db.collection(dbName);
const connect = function () {
  client = mqtt.connect({ host:'broker.shiftr.io', port:1883, username:process.env.USERNAME, password:process.env.PASSWORD, clientId:"hub_" + Math.random().toString(16).substr(2, 8)  });
  client.subscribe('#');
  client.on('message', insertEvent);
}
// });

const insertEvent = function(topic, payload) {
//   // Get the documents collection
//   // const collection = db.collection('documents');
//   console.log(topic + ", " + payload);
//   // deviceClient.publish("state","json",'{"d" : { "cpu" : 60, "mem" : 50 }}');
//   // Insert some documents
//   collection.updateOne(
//     { _id: topic },
//     { $push: { events: { event: { value:parseInt(payload), when:new Date() } } } },
//     { upsert: true },
//     function(err,docs) {
//       if(err) { console.log("Insert fail"); } // Improve error handling
//     }
//   );
  const els = topic.split('/');
  thingName = els[0];
  
  var thing = things.find(thing => thing.name === thingName)
  if (!thing) {
    thing = new Thing({ 
      path: path.resolve(directory, thingName + '.csv'),
      // headers to write
      headers: ['stream', 'timestamp', 'value'],
      name: thingName
    });
    things.push(thing);
  }
  console.log();
  console.log(JSON.stringify(thing));
  console.log("\n");
  if (!thing.created) {
    console.log("not created");
    thing.create([
      { timestamp: new Date(), stream: topic, value: payload }
    ])
  } else {
    console.log("created");
    thing.append([
      { timestamp: new Date(), stream: topic, value: payload }
    ])
  }
  
  // for (const thing of things) {
  //   if (thing.name === thingName) {
  //     if (thing.created
  //   }
  // }
}

connect();

