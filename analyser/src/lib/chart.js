var d3 = require("d3");

class Chart {
	constructor(data, height, title) {
		this.data = data;
		this.margin = {
			top: 30,
			right: 50,
			bottom: 20,
			left: 50
		};
		this.width = window.innerWidth - this.margin.left - this.margin.right;
		this.height = height - this.margin.top - this.margin.bottom;
		this.title = title;

		this.draw();
	}
}

class LineChart extends Chart {
	constructor(data, height, title) {
		super(data, height, title);
	}

	draw() {

		// console.log(this.data)
		// 5. X scale will use the index of our data
		this.xScale = d3.scaleTime()
			.domain([d3.min(this.data, d => d._time), d3.max(this.data, d => d._time)]) // input
			.range([0, this.width]) // output

		// 6. Y scale will use the randomly generate number
		this.yScale = d3.scaleLinear()
			.domain([0, d3.max(this.data, d => d._value)]) // input
			.range([this.height, 0]) // output

		this.xAxis = d3.axisBottom(this.xScale)
			.ticks(5)
		this.yAxis = d3.axisLeft(this.yScale)
			.ticks(5)

		// 7. d3's line generator
		this.line = d3.area()
			.x((function(d, i) {
				return this.xScale(d._time);
			}).bind(this)) // set the x values for the line generator
			.y0(this.yScale(0))
			.y1((function(d) {
				return this.yScale(d._value);
			}).bind(this)) // set the y values for the line generator
			.curve(d3.curveStepAfter) // apply smoothing to the line

		// 1. Add the SVG to the page and employ #2
		this.svg = d3.select("body").append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

		this.svg.append("path")
			.attr("class", "line")

		this.svg.append('text')
			.text(this.title)
			.attr('y', -10)

		// 3. Call the x axis in a group tag
		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
			.call(this.xAxis); // Create an axis component with d3.axisBottom

		// 4. Call the y axis in a group tag
		this.svg.append("g")
			.attr("class", "y axis")
			.call(this.yAxis); // Create an axis component with d3.axisLeft

		// 9. Append the path, bind the data, and call the line generator
		this.update();

	}

	update() {
		this.xScale = d3.scaleTime()
			.domain([d3.min(this.data, d => d._time), d3.max(this.data, d => d._time)]) // input
			.range([0, this.width]); // output

		this.yScale = d3.scaleLinear()
			.domain([0, d3.max(this.data, d => d._value)]) // input
			.range([this.height, 0]); // output

		this.xAxis = d3.axisBottom(this.xScale)
			.ticks(8)
		this.yAxis = d3.axisLeft(this.yScale)
			.ticks(5)

		this.svg.selectAll(".line")
			.datum(this.data) // 10. Binds data to the line
			.attr("class", "line") // Assign a class for styling
			.attr("d", this.line); // 11. Calls the line generator

		this.svg.select('.x.axis')
			.call(this.xAxis);

		this.svg.select('.y.axis')
			.call(this.yAxis);
	}
}

class BlockChart extends Chart {
	constructor(data, height, title) {
		super(data, height, title);
	}

	draw() {
		// 5. X scale will use the index of our data
		this.xScale = d3.scaleTime()
			.domain([d3.min(this.data, d => d._time), d3.max(this.data, d => d._time)]) // input
			.range([0, this.width]); // output

		this.colorScale = d3.scaleLinear()
			.domain([d3.min(this.data, d => d._value), d3.max(this.data, d => d._value)])
			.range([0.0, 1.0]);

		this.xAxis = d3.axisBottom(this.xScale)

		// 1. Add the SVG to the page and employ #2
		this.svg = d3.select("body").append("svg")
			.attr('class', 'block-chart')
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		// 3. Call the x axis in a group tag
		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
			.call(this.xAxis);

		// // 4. Call the y axis in a group tag
		// svg.append("g")
		// 	.attr("class", "y axis")
		// 	.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

		this.svg.append('text')
			.text(this.title)
			.attr('y', -10)

		// // 9. Append the path, bind the data, and call the line generator
		// svg.append("path")
		// 	.datum(data) // 10. Binds data to the line
		// 	.attr("class", "line") // Assign a class for styling
		// 	.attr("d", line); // 11. Calls the line generator

		this.update();
	}

	update() {
		this.xScale = d3.scaleTime()
			.domain([d3.min(this.data, d => d._time), d3.max(this.data, d => d._time)]) // input
			.range([0, this.width]); // output

		this.colorScale = d3.scaleLinear()
			.domain([d3.min(this.data, d => d._value), d3.max(this.data, d => d._value)])
			.range([0.0, 1.0]);

		// this.svg.select('x-axis')
		// 	.duration(750)
		// 	.call(xAxis);

		this.xAxis = d3.axisBottom(this.xScale)

		this.svg.selectAll('rect')
			.data(this.data)
			.enter()
			.append('rect')
			.attr('x', (function(d) {
				return this.xScale(d._time);
			}).bind(this))
			.attr('y', 0)
			.attr('height', this.height)
			.attr('width', this.width / this.data.length)
			.attr('fill-opacity', (function(d) {
				return this.colorScale(d._value);
			}).bind(this))

		this.svg.select('.x.axis')
			.call(this.xAxis)
	}
}

module.exports = {
	LineChart,
	BlockChart
}