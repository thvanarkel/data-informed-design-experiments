const mqtt = require('mqtt')
const dotenv = require('dotenv').config()
const path = require('path')
const fs = require('fs')
const csv = require('fast-csv')
const {InfluxDB, Point, FluxTableMetaData} = require('@influxdata/influxdb-client')
const {hostname} = require('os')

const directory = require('os').homedir() + '/Documents/sensor-data';

const dbClient = new InfluxDB({url: process.env.HOST, token: process.env.TOKEN})

var points = [];

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
    this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true, rowDelimiter:"\n" };
    this.name = opts.name;
    this.readings = [];
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
    await Thing.write(fs.createWriteStream(this.path, { flags: 'a' }), this.readings, {
        ...this.writeOpts,
        writeHeaders: false,
    });
    console.log("pushed " + this.readings.length + " readings");
    this.readings = [];
  }

  addReading(reading) {
    if (!this.created) {
      this.create([
        { timestamp: reading.timestamp, stream: reading.stream, value: reading.value }
      ])
    } else {
      this.readings.push(reading);

    }
  }
}

class Reading {
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
  client.on('message', insertReading);
}

const insertReading = function(topic, payload) {
  const els = topic.split('/');
  thingName = els[0];

  const point = new Point(els[1])
    .tag('thing', thingName)
    .intField('value', parseInt(payload))
    .timestamp(String(new Date().getTime()))

  points.push(point)
  console.log(` ${point}`)

  // // Create Reading
  const reading = new Reading(new Date().toISOString(), topic, payload);

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
  thing.addReading(reading);
  if (thing.readings.length > 5) {
    thing.push()
  }
}

connect();

const update = function () {
  // return new Promise(resolve => {
  //   for (thing of things) {
  //     thing.push();
  //   }
  // })

  console.log('*** WRITE POINTS ***')

  const writeApi = dbClient.getWriteApi(process.env.ORG, process.env.BUCKET, 'ms')
  // setup default tags for all writes through this API
  writeApi.useDefaultTags({location: hostname()})

  cPoints = points
  points = []
  writeApi.writePoints(cPoints)

  // flush pending writes and close writeApi
  writeApi
    .close()
    .then(() => {
      console.log(cPoints)
      console.log('FINISHED ... now try ./query.ts')
    })
}

setInterval(update, 5000);
