"use strict";

var {
	LineChart,
	BlockChart
} = require("./lib/chart.js");

var querier = require("./lib/querier.js")

const dotenv = require('dotenv').config()
querier.config(process.env.URL, process.env.TOKEN, process.env.ORG);

let thing = "monitor"
let measurement = "sound"
let fn = "max"
let w = "2m"

const queryData = async (thing, start, measurement, w, fn) => {
	let q = `from(bucket: "Test") |> range(start: ${start}) |> filter(fn: (r) => r["thing"] == "${thing}") |> filter(fn: (r) => r["_field"] == "value") |> filter(fn: (r) => r["_measurement"] == "${measurement}") |> aggregateWindow(every: ${w}, fn: ${fn})`;
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
	var data = await queryData("monitor", "-2h", "sound", "2s", "max");
	soundRaw = new LineChart(data, 200, "monitor/sound [2s](max)");
	soundRaw.draw()

	data = await queryData("monitor", "-2h", "sound", "1m", "max");
	soundWindow = new LineChart(data, 200, "monitor/sound [1m](max)");
	soundWindowBlock = new BlockChart(data, 100, "monitor/sound [1m](max)");

	data = await queryData("monitor", "-2h", "motion", "1m", "max");
	motionWindow = new LineChart(data, 200, "monitor/motion [1m](max)");
	motionWindowBlock = new BlockChart(data, 100, "monitor/motion [1m](max)");

	data = await queryData("bed", "-2h", "motion", "1m", "max");
	bedWindow = new LineChart(data, 200, "bed/motion [1m](max)");
	bedWindowBlock = new BlockChart(data, 100, "bed/motion [1m](max)");
	data = await queryData("bed", "-2h", "sound", "1m", "max");
	bedSoundWindow = new LineChart(data, 200, "bed/sound [1m](max)");
	bedSoundWindowBlock = new BlockChart(data, 100, "bed/sound [1m](max)");
}

// const updateCharts = async () => {
// 	console.log("updating");
// 	var data = await queryData("monitor", "-2h", "sound", "2s", "max");
// 	soundRaw.data = data;
// 	soundRaw.update()
//
// 	data = await queryData("monitor", "-2h", "sound", "1m", "max");
// 	soundWindow.data = data;
// 	soundWindow.update()
// 	soundWindowBlock.data = data;
// 	soundWindowBlock.update()
//
// 	data = await queryData("monitor", "-2h", "motion", "1m", "max");
// 	motionWindow.data = data;
// 	motionWindow.update()
// 	motionWindowBlock.data = data;
// 	motionWindowBlock.update()
// }

drawCharts();
// setInterval(updateCharts, 30000);