const mqtt = require('mqtt')
const dotenv = require('dotenv').config()
const path = require('path')
const fs = require('fs')
const csv = require('fast-csv')

const directory = require('os').homedir() + '/Documents/sensor-data';

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
    this.events = [];
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
  
  async push() {
    await Thing.write(fs.createWriteStream(this.path, { flags: 'a' }), this.events, {
        ...this.writeOpts,
        writeHeaders: false,
    });
    console.log("pushed " + this.events.length + " events");
    this.events = [];
  }
  
  addEvent(event) {
    if (!this.created) {
      this.create([
        { timestamp: event.timestamp, stream: event.stream, value: event.value }
      ])
    } else {
      this.events.push(event);

    }
  }
}

class Event {
  constructor(timestamp, stream, value) {
    this.timestamp = timestamp;
    this.stream = stream;
    this.value = value;
  }
}

var things = [];

const connect = function () {
  client = mqtt.connect({ host:'broker.shiftr.io', port:1883, username:process.env.USERN, password:process.env.PASSWORD, clientId:"hub_" + Math.random().toString(16).substr(2, 8)  });
  client.subscribe('#');
  client.on('message', insertEvent);
}

const insertEvent = function(topic, payload) {
  // Create Event
  const event = new Event(new Date(), topic, payload);
  
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
  thing.addEvent(event);
  // if (thing.events.length > 5) {
  //   thing.push()
  // }
}

connect();

const update = function () {
  return new Promise(resolve => {
    for (thing of things) {
      thing.push();
    }
  })
}

setInterval(update, 5000);
