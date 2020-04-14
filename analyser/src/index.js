"use strict";

var {
	Chart,
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

const drawCharts = async () => {
	var data = await queryData("monitor", "-2h", "sound", "2s", "max");
	console.log(data)
	var soundRaw = new Chart(data, 200);
	soundRaw.draw()

	data = await queryData("monitor", "-2h", "sound", "1m", "max");
	var soundWindow = new Chart(data, 200);
	soundWindow.draw()
	var soundWindowBlock = new BlockChart(data, 100);
	soundWindowBlock.draw()

	data = await queryData("monitor", "-2h", "motion", "1m", "max");
	var motionWindow = new Chart(data, 200);
	motionWindow.draw()
	var motionWindowBlock = new BlockChart(data, 100);
	motionWindowBlock.draw()
}

drawCharts();