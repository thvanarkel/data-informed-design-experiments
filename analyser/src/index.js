"use strict";



var Chart = require("./lib/chart.js");


const dotenv = require('dotenv').config()
console.log(dotenv)
const {
	InfluxDB,
	Point,
	FluxTableMetaData
} = require('@influxdata/influxdb-client')

const db = new InfluxDB({
	url: process.env.URL,
	token: process.env.TOKEN
})
console.log(db)
let queryApi = db.getQueryApi(process.env.ORG);
console.log(queryApi);
let fluxQuery = 'from(bucket: "Test") |> range(start: -1h) |> filter(fn: (r) => r["thing"] == "monitor") |> filter(fn: (r) => r["_field"] == "value") |> filter(fn: (r) => r["_measurement"] == "sound") |> aggregateWindow(every: 2s, fn: mean)';

// performs query and receive line table metadata and rows
// https://v2.docs.influxdata.com/v2.0/reference/syntax/annotated-csv/
var data = [];

queryApi.queryRows(fluxQuery, {
	next(row, tableMeta) {
		const o = tableMeta.toObject(row);
		o._time = new Date(o._time);
		data.push(o);
	},
	error(error) {
		console.error(error);
		console.log('\nFinished ERROR');
	},
	complete() {
		console.log('\nFinished SUCCESS');
		console.log(data)
		var chart = new Chart(data);
		chart.draw();
		query();
	},
});

var query = () => {
	data = [];
	fluxQuery = 'from(bucket: "Test") |> range(start: -1h) |> filter(fn: (r) => r["thing"] == "monitor") |> filter(fn: (r) => r["_field"] == "value") |> filter(fn: (r) => r["_measurement"] == "sound") |> aggregateWindow(every: 30s, fn: mean)';

	queryApi.queryRows(fluxQuery, {
		next(row, tableMeta) {
			const o = tableMeta.toObject(row);
			o._time = new Date(o._time);
			data.push(o);
		},
		error(error) {
			console.error(error);
			console.log('\nFinished ERROR');
		},
		complete() {
			console.log('\nFinished SUCCESS');
			console.log(data)
			var chart = new Chart(data);
			chart.draw();
		},
	});
}





// var svg = d3.select("svg"),
// 	margin = {
// 		top: 20,
// 		right: 20,
// 		bottom: 110,
// 		left: 40
// 	},
// 	margin2 = {
// 		top: 430,
// 		right: 20,
// 		bottom: 30,
// 		left: 40
// 	},
// 	width = +svg.attr("width") - margin.left - margin.right,
// 	height = +svg.attr("height") - margin.top - margin.bottom,
// 	height2 = +svg.attr("height") - margin2.top - margin2.bottom;
//
// var parseDate = d3.timeParse("%a %b %d %Y %H:%M:%S");
//
// var x = d3.scaleTime().range([0, width]),
// 	x2 = d3.scaleTime().range([0, width]),
// 	y = d3.scaleLinear().range([height, 0]),
// 	y2 = d3.scaleLinear().range([height2, 0]);
//
// var xAxis = d3.axisBottom(x),
// 	xAxis2 = d3.axisBottom(x2),
// 	yAxis = d3.axisLeft(y);
//
// var brush = d3.brushX()
// 	.extent([
// 		[0, 0],
// 		[width, height2]
// 	])
// 	.on("brush end", brushed);
//
// var zoom = d3.zoom()
// 	.scaleExtent([1, Infinity])
// 	.translateExtent([
// 		[0, 0],
// 		[width, height]
// 	])
// 	.extent([
// 		[0, 0],
// 		[width, height]
// 	])
// 	.on("zoom", zoomed);
//
// var area = d3.area()
// 	.curve(d3.curveMonotoneX)
// 	.x(function(d) {
// 		return x(d.timestamp);
// 	})
// 	.y0(height)
// 	.y1(function(d) {
// 		return y(d.value);
// 	});
//
// var area2 = d3.area()
// 	.curve(d3.curveMonotoneX)
// 	.x(function(d) {
// 		return x2(d.timestamp);
// 	})
// 	.y0(height2)
// 	.y1(function(d) {
// 		return y2(d.value);
// 	});
//
// svg.append("defs").append("clipPath")
// 	.attr("id", "clip")
// 	.append("rect")
// 	.attr("width", width)
// 	.attr("height", height);
//
// var focus = svg.append("g")
// 	.attr("class", "focus")
// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
// var context = svg.append("g")
// 	.attr("class", "context")
// 	.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
//
// d3.csv("./data/bed.csv", type).then(function(data, error) {
// 	if (error) throw error;
// 	var subset = data.filter(d => d.stream === "bed/light")
//
// 	x.domain(d3.extent(subset, function(d) {
// 		return d.timestamp;
// 	}));
// 	y.domain([0, d3.max(subset, function(d) {
// 		return d.value;
// 	})]);
// 	x2.domain(x.domain());
// 	y2.domain(y.domain());
//
// 	focus.append("path")
// 		.datum(subset)
// 		.attr("class", "area")
// 		.attr("d", area);
//
// 	focus.append("g")
// 		.attr("class", "axis axis--x")
// 		.attr("transform", "translate(0," + height + ")")
// 		.call(xAxis);
//
// 	focus.append("g")
// 		.attr("class", "axis axis--y")
// 		.call(yAxis);
//
// 	context.append("path")
// 		.datum(subset)
// 		.attr("class", "area")
// 		.attr("d", area2);
//
// 	context.append("g")
// 		.attr("class", "axis axis--x")
// 		.attr("transform", "translate(0," + height2 + ")")
// 		.call(xAxis2);
//
// 	context.append("g")
// 		.attr("class", "brush")
// 		.call(brush)
// 		.call(brush.move, x.range());
//
// 	svg.append("rect")
// 		.attr("class", "zoom")
// 		.attr("width", width)
// 		.attr("height", height)
// 		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
// 		.call(zoom);
// });
//
// function brushed() {
// 	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
// 	var s = d3.event.selection || x2.range();
// 	x.domain(s.map(x2.invert, x2));
// 	focus.select(".area").attr("d", area);
// 	focus.select(".axis--x").call(xAxis);
// 	svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
// 		.scale(width / (s[1] - s[0]))
// 		.translate(-s[0], 0));
// }
//
// function zoomed() {
// 	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
// 	var t = d3.event.transform;
// 	x.domain(t.rescaleX(x2).domain());
// 	focus.select(".area").attr("d", area);
// 	focus.select(".axis--x").call(xAxis);
// 	context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
// }
//
// function type(d) {
// 	d.timestamp = parseDate(d.timestamp);
// 	d.stream = d.stream;
// 	d.value = +d.value;
// 	return d;
// }