'use strict'

var d3 = require("d3");
const dotenv = require('dotenv').config()
console.log(dotenv)
const {
	InfluxDB,
	Point,
	FluxTableMetaData
} = require('@influxdata/influxdb-client')


var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");

console.log(new Date("2020-04-14T09:48:54.56506527Z"))



const db = new InfluxDB({
	url: process.env.URL,
	token: process.env.TOKEN
})
console.log(db)
const queryApi = db.getQueryApi(process.env.ORG);
console.log(queryApi);
const fluxQuery = 'from(bucket: "Test") |> range(start: -1h) |> filter(fn: (r) => r["thing"] == "monitor") |> filter(fn: (r) => r["_field"] == "value") |> filter(fn: (r) => r["_measurement"] == "sound")';
console.log('*** QUERY ROWS ***');
// performs query and receive line table metadata and rows
// https://v2.docs.influxdata.com/v2.0/reference/syntax/annotated-csv/

var data = [];

queryApi.queryRows(fluxQuery, {
	next(row, tableMeta) {
		const o = tableMeta.toObject(row);
		o._time = new Date(o._time);
		data.push(o);
		// console.log(JSON.stringify(o, null, 2))
		// console.log(`${o._time} ${o._measurement} in '${o.location}' (${o.example}): ${o._field}=${o._value}`);
	},
	error(error) {
		console.error(error);
		console.log('\nFinished ERROR');
	},
	complete() {
		console.log('\nFinished SUCCESS');
		console.log(data)
		drawGraph();
	},
});



const drawGraph = () => {
	// 2. Use the margin convention practice
	var margin = {
			top: 50,
			right: 50,
			bottom: 50,
			left: 50
		},
		width = window.innerWidth - margin.left - margin.right // Use the window's width
		,
		height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

	// The number of datapoints
	var n = 2890;

	// 5. X scale will use the index of our data
	var xScale = d3.scaleTime()
		.domain([d3.min(data, d => d._time), d3.max(data, d => d._time)]) // input
		.range([0, width]); // output

	// 6. Y scale will use the randomly generate number
	var yScale = d3.scaleLinear()
		.domain([0, d3.max(data, d => d._value)]) // input
		.range([height, 0]); // output

	// 7. d3's line generator
	var line = d3.line()
		.x(function(d, i) {
			return xScale(d._time);
		}) // set the x values for the line generator
		.y(function(d) {
			return yScale(d._value);
		}) // set the y values for the line generator
		.curve(d3.curveMonotoneX) // apply smoothing to the line

	// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
	var dataset = d3.range(n).map(function(d) {
		return {
			"y": d3.randomUniform(1)()
		}
	})

	// 1. Add the SVG to the page and employ #2
	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// 3. Call the x axis in a group tag
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

	// 4. Call the y axis in a group tag
	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

	// 9. Append the path, bind the data, and call the line generator
	svg.append("path")
		.datum(data) // 10. Binds data to the line
		.attr("class", "line") // Assign a class for styling
		.attr("d", line); // 11. Calls the line generator

	// 12. Appends a circle for each datapoint
	// svg.selectAll(".dot")
	// 	.data(data)
	// 	.enter().append("circle") // Uses the enter().append() method
	// 	.attr("class", "dot") // Assign a class for styling
	// 	.attr("cx", function(d, i) {
	// 		return xScale(i)
	// 	})
	// 	.attr("cy", function(d) {
	// 		return yScale(d._value)
	// 	})
	// 	.attr("r", 5)
	// 	.on("mouseover", function(a, b, c) {
	// 		console.log(a)
	// 		this.attr('class', 'focus')
	// 	})
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