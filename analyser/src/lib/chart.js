var d3 = require("d3");

class Chart {
	hasYAxis = true;

	constructor(card, data, height, title) {
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
		this.card = card

		this.draw();
	}

	get data() {
		return this._data;
	}

	set data(d) {
		this._data = d;
		if (this.initialised) this.update();
	}

	draw() {
		this.svg = d3.select(this.card).append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

		this.svg.append('text')
			.text(this.title)
			.attr('y', -10)

		// Create the groups for the axes
		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")

		if (this.hasYAxis) {
			this.svg.append("g")
				.attr("class", "y axis")
		}

		this.updateXAxis();
		if (this.hasYAxis) this.updateYAxis();
		this.initialised = true;
	}

	update() {
		this.updateXAxis();
		if (this.hasYAxis) this.updateYAxis();
	}

	updateXAxis() {
		this.xScale = d3.scaleTime()
			.domain([d3.min(this.data, d => d._time), d3.max(this.data, d => d._time)]) // input
			.range([0, this.width]) // output

		this.xAxis = d3.axisBottom(this.xScale)
			.ticks(5)

		this.svg.select('.x.axis')
			.call(this.xAxis)
	}
	updateYAxis() {
		this.yScale = d3.scaleLinear()
			.domain([0, d3.max(this.data, d => d._value)]) // input
			.range([this.height, 0]) // output

		this.yAxis = d3.axisLeft(this.yScale)
			.ticks(5)

		this.svg.select('.y.axis')
			.call(this.yAxis)
	}
}

class LineChart extends Chart {
	constructor(card, data, height, title) {
		super(card, data, height, title);
		this.hasYAxis = true;
	}

	draw() {
		super.draw();

		// Create the line generator
		this.line = d3.area()
			.x((function(d, i) {
				return this.xScale(d._time);
			}).bind(this)) // set the x values for the line generator
			.y0(this.yScale(0))
			.y1((function(d) {
				return this.yScale(d._value);
			}).bind(this)) // set the y values for the line generator
			.curve(d3.curveStepAfter) // apply smoothing to the line

		// Name the SVG
		this.svg.attr('class', 'line-chart')

		this.svg.append("path")
			.attr("class", "line")

		this.update();
	}

	update() {
		super.update();

		this.svg.selectAll(".line")
			.datum(this.data) // 10. Binds data to the line
			.attr("class", "line") // Assign a class for styling
			.attr("d", this.line); // 11. Calls the line generator
	}
}

class BlockChart extends Chart {
	constructor(card, data, height, title) {
		super(card, data, height, title);
		this.hasYAxis = false;
	}

	draw() {
		super.draw()

		this.colorScale = this.colorSchale();

		// Name the SVG
		this.svg.attr('class', 'block-chart')

		this.update();
	}

	update() {
		super.update();

		this.colorScale = this.colorSchale();

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
	}

	colorSchale() {
		return d3.scaleLinear()
			.domain([d3.min(this.data, d => d._value), d3.max(this.data, d => d._value)])
			.range([0.0, 1.0]);
	}
}

module.exports = {
	LineChart,
	BlockChart
}
