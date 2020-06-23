import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: this.parseData(props.data),
		}
		this.margin = {
			top: 10,
			right: 10,
			bottom: 20,
			left: 30
		};
		this.width = props.width - this.margin.left - this.margin.right;
		this.height = props.height - this.margin.top - this.margin.bottom;
		this.hasYAxis = true;
	}

	parseData(d) {
		for (const e of d) {
			e._time = new Date(e._time)
		}
		return d;
	}

  componentDidMount() {
		this.svg = d3.select('#graph-' + this.props.index ).append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
    this.drawChart();
  }

	componentDidUpdate(prevProps) {
		// console.log(this.props.data);
		if (this.props.width != prevProps.width) {
			this.width = this.props.width - this.margin.left - this.margin.right;
			this.svg.attr("width", this.width + this.margin.left + this.margin.right);
		}
		if (!this.state.data.length) {
			return;
		}
		this.update();
	}

  drawChart() {
		// console.log(data)
		//
		// const h = this.props.height;
		// const w = this.props.width;
		//
		// const svg = d3.select(".graph").append("svg")
  	// 	.attr("width", this.props.width)
  	// 	.attr("height", this.props.height);
		//
    // svg.selectAll("rect")
    //   .data(data)
    //   .enter()
    //   .append("rect")
    //   .attr("x", (d, i) => i * ((w - data.length * 5) / (data.length ) + 5))
    //   .attr("y", (d, i) => h - 10 * d)
    //   .attr("width", (w - data.length * 5) / data.length)
    //   .attr("height", (d, i) => d * 10)
    //   .attr("fill", "green")

		// FROM Graph-> draw()


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

		// FROM LineGraph -> draw()
		// Create the line generator
		this.line = d3.area()
			.x((function(d, i) {
				return this.xScale(d._time);
			}).bind(this)) // set the x values for the line generator
			.y0((function(d) {
				return this.yScale(0);
			}).bind(this))
			.y1((function(d) {
				return this.yScale(d._value);
			}).bind(this)) // set the y values for the line generator
			.curve(d3.curveBasis) // apply smoothing to the line

		// Name the SVG
		this.svg.attr('class', 'line-chart')

		this.svg.append("path")
			.attr("class", "line")
	}

	update() {
		this.updateXAxis();
		if (this.hasYAxis) this.updateYAxis();

		// console.log(this.height)
		// FROM LineGraph -> update()
		this.svg.selectAll(".line")
			.datum(this.state.data) // 10. Binds data to the line
			.attr("class", "line") // Assign a class for styling
			.attr("d", this.line); // 11. Calls the line generator
		}

		updateXAxis() {
			this.xScale = d3.scaleTime()
				.domain([d3.min(this.state.data, d => d._time), d3.max(this.state.data, d => d._time)]) // input
				.range([0, this.width]) // output

			this.xAxis = d3.axisBottom(this.xScale)
				.ticks(5)

			this.svg.select('.x.axis')
				.call(this.xAxis)
		}

		updateYAxis() {
			this.yScale = d3.scaleLinear()
				.domain([0, d3.max(this.state.data, d => d._value)]) // input
				.range([this.height, 0]) // output

			this.yAxis = d3.axisLeft(this.yScale)
				.ticks(5)

			this.svg.select('.y.axis')
				.call(this.yAxis)
		}



  render(){
		// const style = `
		// 	.line {
		// 		fill: #F7DDDC;
		// 		stroke: #EE3A2A;
		// 		stroke-width: 1;
		// 	}
		// `;
		// <style jsx>{style}</style>
    return (
			<div id={"graph-" + this.props.index}></div>
		)
  }
}

export default BarChart;

// class Graph extends Component {
// 	hasYAxis = true;
//
// 	constructor(card, data, height, title) {
// 		super();
// 		this.data = data;
// 		this.margin = {
// 			top: 30,
// 			right: 50,
// 			bottom: 20,
// 			left: 50
// 		};
// 		this.width = 200 - this.margin.left - this.margin.right;
// 		this.height = height - this.margin.top - this.margin.bottom;
// 		this.title = title;
// 		this.card = 'graph'
//
// 		this.draw();
// 	}
//
// 	get data() {
// 		return this._data;
// 	}
//
// 	set data(d) {
// 		this._data = d;
// 		if (this.initialised) this.update();
// 	}
//
// 	draw() {
// 		this.svg = d3.select(this.card).append("svg")
// 			.attr("width", this.width + this.margin.left + this.margin.right)
// 			.attr("height", this.height + this.margin.top + this.margin.bottom)
// 			.append("g")
// 			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
//
// 		this.svg.append('text')
// 			.text(this.title)
// 			.attr('y', -10)
//
// 		// Create the groups for the axes
// 		this.svg.append("g")
// 			.attr("class", "x axis")
// 			.attr("transform", "translate(0," + this.height + ")")
//
// 		if (this.hasYAxis) {
// 			this.svg.append("g")
// 				.attr("class", "y axis")
// 		}
//
// 		this.updateXAxis();
// 		if (this.hasYAxis) this.updateYAxis();
// 		this.initialised = true;
// 	}
//
// 	update() {
// 		this.updateXAxis();
// 		if (this.hasYAxis) this.updateYAxis();
// 	}
//
// 	updateXAxis() {
// 		this.xScale = d3.scaleTime()
// 			.domain([d3.min(this.data, d => d._time), d3.max(this.data, d => d._time)]) // input
// 			.range([0, this.width]) // output
//
// 		this.xAxis = d3.axisBottom(this.xScale)
// 			.ticks(5)
//
// 		this.svg.select('.x.axis')
// 			.call(this.xAxis)
// 	}
// 	updateYAxis() {
// 		this.yScale = d3.scaleLinear()
// 			.domain([0, d3.max(this.data, d => d._value)]) // input
// 			.range([this.height, 0]) // output
//
// 		this.yAxis = d3.axisLeft(this.yScale)
// 			.ticks(5)
//
// 		this.svg.select('.y.axis')
// 			.call(this.yAxis)
// 	}
// 	componentDidMount() {
// 		this.draw();
// 	}
// 	componentDidUpdate() {
// 		this.update();
// 	}
// 	render() {
// 		return (
// 			<div className="graph" />
// 		)
// 	}
// }
//
// export default Graph;

// class LineGraph extends Graph {
// 	constructor(card, data, height, title) {
// 		super(card, data, height, title);
// 		this.hasYAxis = true;
// 	}
//
// 	draw() {
// 		super.draw();
//
// 		// Create the line generator
// 		this.line = d3.area()
// 			.x((function(d, i) {
// 				return this.xScale(d._time);
// 			}).bind(this)) // set the x values for the line generator
// 			.y0(this.yScale(0))
// 			.y1((function(d) {
// 				return this.yScale(d._value);
// 			}).bind(this)) // set the y values for the line generator
// 			.curve(d3.curveStepAfter) // apply smoothing to the line
//
// 		// Name the SVG
// 		this.svg.attr('class', 'line-chart')
//
// 		this.svg.append("path")
// 			.attr("class", "line")
//
// 		this.update();
// 	}
//
// 	update() {
// 		super.update();
//
// 		this.svg.selectAll(".line")
// 			.datum(this.data) // 10. Binds data to the line
// 			.attr("class", "line") // Assign a class for styling
// 			.attr("d", this.line); // 11. Calls the line generator
// 	}
// }
//
// class BlockGraph extends Graph {
// 	constructor(card, data, height, title) {
// 		super(card, data, height, title);
// 		this.hasYAxis = false;
// 	}
//
// 	draw() {
// 		super.draw()
//
// 		this.colorScale = this.colorSchale();
//
// 		// Name the SVG
// 		this.svg.attr('class', 'block-chart')
//
// 		this.update();
// 	}
//
// 	update() {
// 		super.update();
//
// 		this.colorScale = this.colorSchale();
//
// 		this.svg.selectAll('rect')
// 			.data(this.data)
// 			.enter()
// 			.append('rect')
// 			.attr('x', (function(d) {
// 				return this.xScale(d._time);
// 			}).bind(this))
// 			.attr('y', 0)
// 			.attr('height', this.height)
// 			.attr('width', this.width / this.data.length)
// 			.attr('fill-opacity', (function(d) {
// 				return this.colorScale(d._value);
// 			}).bind(this))
// 	}
//
// 	colorSchale() {
// 		return d3.scaleLinear()
// 			.domain([d3.min(this.data, d => d._value), d3.max(this.data, d => d._value)])
// 			.range([0.0, 1.0]);
// 	}
// }
//
// module.exports = {
// 	LineGraph,
// 	BlockGraph
// }
