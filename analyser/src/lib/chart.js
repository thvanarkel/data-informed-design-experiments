var d3 = require("d3");

module.exports = class Chart {
	constructor(data) {
		this.data = data;
	}

	draw() {
		// 2. Use the margin convention practice
		var margin = {
				top: 20,
				right: 50,
				bottom: 20,
				left: 50
			},
			width = window.innerWidth - margin.left - margin.right, // Use the window's width
			height = 150 - margin.top - margin.bottom; // Use the window's height

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
		var line = d3.area()
			.x(function(d, i) {
				return xScale(d._time);
			}) // set the x values for the line generator
			.y0(yScale(0))
			.y1(function(d) {
				return yScale(d._value);
			}) // set the y values for the line generator
			.curve(d3.curveStep) // apply smoothing to the line

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
	}
}