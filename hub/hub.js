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

var things = [];

const connect = function () {
  client = mqtt.connect({ host:'broker.shiftr.io', port:1883, username:process.env.USERNAME, password:process.env.PASSWORD, clientId:"hub_" + Math.random().toString(16).substr(2, 8)  });
  client.subscribe('#');
  client.on('message', insertEvent);
}

const insertEvent = function(topic, payload) {
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
}

connect();

