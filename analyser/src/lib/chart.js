var d3 = require("d3");

class Chart {
	constructor(data, height) {
		this.data = data;
		this.margin = {
			top: 20,
			right: 50,
			bottom: 20,
			left: 50
		};
		this.width = window.innerWidth - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;
	}

	draw() {

		// console.log(this.data)
		// 5. X scale will use the index of our data
		var xScale = d3.scaleTime()
			.domain([d3.min(this.data, d => d._time), d3.max(this.data, d => d._time)]) // input
			.range([0, this.width]); // output

		// 6. Y scale will use the randomly generate number
		var yScale = d3.scaleLinear()
			.domain([0, d3.max(this.data, d => d._value)]) // input
			.range([this.height, 0]); // output

		// 7. d3's line generator
		var line = d3.area()
			.x(function(d, i) {
				return xScale(d._time);
			}) // set the x values for the line generator
			.y0(yScale(0))
			.y1(function(d) {
				return yScale(d._value);
			}) // set the y values for the line generator
			.curve(d3.curveStepAfter) // apply smoothing to the line

		// 1. Add the SVG to the page and employ #2
		var svg = d3.select("body").append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		// 3. Call the x axis in a group tag
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
			.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

		// 4. Call the y axis in a group tag
		svg.append("g")
			.attr("class", "y axis")
			.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

		// 9. Append the path, bind the data, and call the line generator
		svg.append("path")
			.datum(this.data) // 10. Binds data to the line
			.attr("class", "line") // Assign a class for styling
			.attr("d", line); // 11. Calls the line generator
	}
}

class BlockChart {
	constructor(data, height) {
		this.data = data;
		this.margin = {
			top: 20,
			right: 50,
			bottom: 20,
			left: 50
		};
		this.width = window.innerWidth - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;
	}

	draw() {
		// 5. X scale will use the index of our data
		var xScale = d3.scaleTime()
			.domain([d3.min(this.data, d => d._time), d3.max(this.data, d => d._time)]) // input
			.range([0, this.width]); // output

		// // 6. Y scale will use the randomly generate number
		// var yScale = d3.scaleLinear()
		// 	.domain([0, d3.max(this.data, d => d._value)]) // input
		// 	.range([this.height, 0]); // output

		var colorScale = d3.scaleLinear()
			.domain([d3.min(this.data, d => d._value), d3.max(this.data, d => d._value)])
			.range([0.0, 1.0]);

		// 7. d3's line generator


		//
		// var line = d3.area()
		// 	.x(function(d, i) {
		// 		return xScale(d._time);
		// 	}) // set the x values for the line generator
		// 	.y0(yScale(0))
		// 	.y1(function(d) {
		// 		return yScale(d._value);
		// 	}) // set the y values for the line generator
		// 	.curve(d3.curveStep) // apply smoothing to the line

		// 1. Add the SVG to the page and employ #2
		var svg = d3.select("body").append("svg")
			.attr('class', 'block-chart')
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		// 3. Call the x axis in a group tag
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
			.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

		// // 4. Call the y axis in a group tag
		// svg.append("g")
		// 	.attr("class", "y axis")
		// 	.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

		svg.selectAll('rect')
			.data(this.data)
			.enter()
			.append('rect')
			.attr('x', function(d) {
				return xScale(d._time);
			})
			.attr('y', 10)
			.attr('height', 50)
			.attr('width', this.width / this.data.length)
			.attr('fill-opacity', function(d) {
				return colorScale(d._value);
			})

		// // 9. Append the path, bind the data, and call the line generator
		// svg.append("path")
		// 	.datum(data) // 10. Binds data to the line
		// 	.attr("class", "line") // Assign a class for styling
		// 	.attr("d", line); // 11. Calls the line generator
	}
}

module.exports = {
	Chart,
	BlockChart
}