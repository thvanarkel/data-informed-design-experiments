const mqtt = require('mqtt')
const dotenv = require('dotenv').config()
const path = require('path')
const fs = require('fs')
const csv = require('fast-csv')
const {InfluxDB, Point, FluxTableMetaData} = require('@influxdata/influxdb-client')
const {hostname} = require('os')

const directory = require('os').homedir() + '/Documents/sensor-data';

const dbClient = new InfluxDB({url: process.env.HOST, token: process.env.TOKEN})

var aLog = {
  collected: 0,
  toDisk: 0,
  toOnline: 0
}

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
    this.points = [];
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
    // Write readings to the csv file on disk
    if (this.readings.length > 0) { // don't write empty arrays
      await Thing.write(fs.createWriteStream(this.path, { flags: 'a' }), this.readings, {
          ...this.writeOpts,
          writeHeaders: false,
      });
      // console.log("wrote " + this.readings.length + " to disk");
      // aLog.toDisk = aLog.toDisk + this.readings.length;
      this.readings = [];
    }

    // Push points to the InfluxDB
    const writeApi = dbClient.getWriteApi(process.env.ORG, process.env.BUCKET, 'ms')
    writeApi.useDefaultTags({location: hostname()})
    writeApi.writePoints(this.points)
    writeApi
      .close()
      .then(() => {
        // console.log("pushed " + this.points.length + " to online database")
        // aLog.toOnline = aLog.toOnline + this.points.length;
        this.points = []
      })
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

  addPoint(point) {
    this.points.push(point);
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
  client = mqtt.connect({ host:'localhost', port:1883, username:process.env.USERN, password:process.env.PASSWORD, clientId:"hub_" + Math.random().toString(16).substr(2, 8)  });
  client.subscribe('#');
  client.on('message', insertReading);
}

const insertReading = function(topic, payload) {
  const els = topic.split('/');
  thingName = els[1];
  time = String(new Date().getTime());

  var data = JSON.parse(payload)

  const point = new Point(els[2])
    .tag('thing', thingName)
    .timestamp(time)
  if ("tags" in data) {
    for (const [key, value] of Object.entries(data.tags)) {
      point.tag(key, value);
    }
  }
  if ("fields" in data) {
    for (const [key, value] of Object.entries(data.fields)) {
      if (value.slice(-1) === 'i') {
        point.intField(key, value)
      } else if (value === "true" || value === "false") {
        console.log("bool!")
        var v = value === "true"
        point.booleanField(key, v)
      } else if (parseFloat(value) !== NaN) {
        point.floatField(key, value)
      } else if (typeof value.slice(-1) === "string") {
        point.stringField(key, value)
      }
    }
  }
  console.log(`${point}`)

  // // Create Reading
  const reading = new Reading(time, topic, payload);

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
  thing.addPoint(point);

  // aLog.collected = aLog.collected + 1;
}

connect();

const update = function () {
  return new Promise(resolve => {
    for (thing of things) {
      thing.push();
    }
  });
}

const updateLog = function() {
  console.log(aLog)
}

const sendEvent = function() {
  // Fake data generation
  var events = ["reset watchdog", "reconnect broker", "reconnect internet", "hardware reset"]
  var number = Math.floor(Math.random() * events.length)
  var event = events[number]
  var index = number+1

  var json = `{"tags":{"event":"${event}"}, "fields":{"value": "${index}i" }}`

  insertReading("/computer/system", json)
}

setInterval(update, 5000);
// setInterval(updateLog, 1000);
setInterval(sendEvent, 1000);
