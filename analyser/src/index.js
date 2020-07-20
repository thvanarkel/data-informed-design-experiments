"use strict";

var {
	LineChart,
	BlockChart
} = require("./lib/chart.js");

var Card = require("./lib/card.js");

var querier = require("./lib/querier.js")

const dotenv = require('dotenv').config()
querier.config(process.env.URL, process.env.TOKEN, process.env.ORG);

let bucket = "session01"
let thing = "bed"
let measurement = "sound"
let fn = "max"
let w = "2m"

const queryData = async (thing, start, stop, measurement, w, fn) => {
	let q = `from(bucket: "${bucket}") |> range(start: ${start}, stop: ${stop}) |> filter(fn: (r) => r["thing"] == "${thing}") |> filter(fn: (r) => r["_field"] == "value") |> filter(fn: (r) => r["_measurement"] == "${measurement}") |> aggregateWindow(every: ${w}, fn: ${fn})`;
	const data = await querier.query(q, {
		rowParser(row) {
			row._time = new Date(row._time);
			return row;
		}
	});
	return data;
}

var soundRaw, soundWindow, soundWindowBlock, motionWindow, motionWindowBlock, bedWindow, bedWindowBlock, bedSoundWindow, bedSoundWindowBlock

const drawCharts = async () => {
	var data = await queryData(thing, "-1h", "-0h", "sound", "2s", "max");
	console.log(data)
	soundRaw = new Card(`${thing}/sound [2s](max)`, "line", data);

	data = await queryData(thing, "-1h", "-0h", "sound", "1m", "max");
	soundWindow = new Card(`${thing}/sound [1m](max)`, "line", data);
	soundWindowBlock = new Card(`${thing}/sound [1m](max)`, "block", data);

	data = await queryData(thing, "-1h", "-0h", "motion", "1m", "max");
	motionWindowBlock = new Card(`${thing}/motion [1m](max)`, "block", data);

	// data = await queryData("bed", "-2h", "motion", "1m", "max");
	// bedWindow = new LineChart(data, 200, "bed/motion [1m](max)");
	// bedWindowBlock = new BlockChart(data, 100, "bed/motion [1m](max)");
	// data = await queryData("bed", "-2h", "sound", "1m", "max");
	// bedSoundWindow = new LineChart(data, 200, "bed/sound [1m](max)");
	// bedSoundWindowBlock = new BlockChart(data, 100, "bed/sound [1m](max)");
}

// const updateCharts = async () => {
// 	console.log("updating");
// 	var data = await queryData("monitor", "-2h", "sound", "2s", "max");
// 	soundRaw.data = data;
//
// 	data = await queryData("monitor", "-2h", "sound", "1m", "max");
// 	soundWindow.data = data;
// 	soundWindowBlock.data = data;
//
// 	data = await queryData("monitor", "-2h", "motion", "1m", "max");
// 	motionWindow.data = data;
// 	motionWindowBlock.data = data;
// }



drawCharts();
// setInterval(updateCharts, 30000);
