"use strict";

var {
	Chart,
	BlockChart
} = require("./lib/chart.js");

var querier = require("./lib/querier.js")

const dotenv = require('dotenv').config()
querier.config(process.env.URL, process.env.TOKEN, process.env.ORG);

const run = async () => {
	let rawQuery = 'from(bucket: "Test") |> range(start: -1h) |> filter(fn: (r) => r["thing"] == "monitor") |> filter(fn: (r) => r["_field"] == "value") |> filter(fn: (r) => r["_measurement"] == "sound") |> aggregateWindow(every: 2s, fn: mean)';
	const rawData = await querier.query(rawQuery, {
		rowParser(row) {
			row._time = new Date(row._time);
			return row;
		}
	});
	var chart = new Chart(rawData, 200);
	chart.draw();
	let windowQuery = 'from(bucket: "Test") |> range(start: -1h) |> filter(fn: (r) => r["thing"] == "monitor") |> filter(fn: (r) => r["_field"] == "value") |> filter(fn: (r) => r["_measurement"] == "sound") |> aggregateWindow(every: 30s, fn: mean)';
	const windowData = await querier.query(windowQuery, {
		rowParser(row) {
			row._time = new Date(row._time);
			return row;
		}
	});
	var windowChart = new Chart(windowData, 200);
	windowChart.draw();
	var blockChart = new BlockChart(windowData, 100);
	blockChart.draw();
}

run();