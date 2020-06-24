import React, { Component } from 'react';
import * as d3 from 'd3';

class Chart extends Component {
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
		this.hasYAxis = props.yAxis !== undefined ? props.yAxis : false;
		if (!this.hasYAxis) this.margin.left = 10;
		this.width = props.width - this.margin.left - this.margin.right;
		this.height = props.height - this.margin.top - this.margin.bottom;
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
		if (this.props.width != prevProps.width) {
			this.width = this.props.width - this.margin.left - this.margin.right;
			d3.select(this.svg.node().parentNode).attr("width", this.width + this.margin.left + this.margin.right);
		}
		if (!this.state.data.length) {
			return;
		}
		this.state.data = this.props.data;
		this.update();
	}

	drawChart() {
		// Create the groups for the axes
		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")

		if (this.hasYAxis) {
			this.svg.append("g")
				.attr("class", "y axis")
		}

		this.updateXAxis();
		this.updateYAxis();
		this.initialised = true;
	}

	update() {
		this.updateXAxis();
		this.updateYAxis();
	}

	updateXAxis() {
		this.xScale = d3.scaleTime()
			.domain([d3.min(this.state.data, d => d._time), d3.max(this.state.data, d => d._time)]) // input
			.range([0, this.width]) // output

		this.xAxis = d3.axisBottom(this.xScale)
			.ticks(20)
			.tickFormat(d3.timeFormat("%H:%M"));

		this.svg.select('.x.axis')
			.call(this.xAxis)
	}

	updateYAxis() {
		let max = this.props.range !== undefined ? this.props.range.max : d3.max(this.state.data, d => d._value)
		this.yScale = d3.scaleLinear()
			.domain([0, max]) // input
			.range([this.height, 0]) // output

		this.yAxis = d3.axisLeft(this.yScale)
			.ticks(5)

		this.svg.select('.y.axis')
			.call(this.yAxis)
	}

	render(){
    return (
			<div className="graph" id={"graph-" + this.props.index}></div>
		)
  }
}

class BarChart extends Chart {
	constructor(props) {
		super(props)
	}

  drawChart() {
		super.drawChart();
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
		super.update();
		this.svg.selectAll(".line")
			.datum(this.state.data) // 10. Binds data to the line
			.attr("class", "line") // Assign a class for styling
			.attr("d", this.line); // 11. Calls the line generator
		}
}

class BlockChart extends Chart {
	constructor(props) {
		super(props)
	}

  drawChart() {
		super.drawChart();

		this.svg.attr('class', 'block-chart')

		var bars = this.svg.selectAll('rect')
			.data(this.state.data)
			.enter()
			.append('rect')
			.attr('x', (function(d, i) {
				return this.xScale(d._time);
			}).bind(this))
			.attr('y', (function(d) {
				return  0.5 * (this.height - this.yScale(d._value));
			}).bind(this))
			.attr('height', (function(d) {
				return this.yScale(d._value);
			}).bind(this))
			.attr('width', 2)

		this.update();
	}

	updateYAxis() {
		let max = this.props.range !== undefined ? this.props.range.max : d3.max(this.state.data, d => d._value)
		console.log(max);
		this.yScale = d3.scaleLinear()
			.domain([0, max]) // input
			.range([5, this.height]) // output

		this.yAxis = d3.axisLeft(this.yScale)
			.ticks(5)

		this.svg.select('.y.axis')
			.call(this.yAxis)
	}

	componentDidUpdate(prevProps) {
		super.componentDidUpdate(prevProps);
		this.update();
	}

	update() {
		super.update();

		this.svg.selectAll('rect')
			.attr('x', (function(d, i) {
				return this.xScale(d._time);
			}).bind(this))
			.attr('y', (function(d) {
				return  0.5 * (this.height - this.yScale(d._value));
			}).bind(this))
			.attr('height', (function(d) {
				return this.yScale(d._value);
			}).bind(this))

			// .attr('fill-opacity', (function(d) {
			// 	return this.colorScale(d._value);
			// }).bind(this))
	}

	// colorSchale() {
	// 	return d3.scaleLinear()
	// 		.domain([d3.min(this.state.data, d => d._value), d3.max(this.state.data, d => d._value)])
	// 		.range([0.0, 1.0]);
	// }

}

export { BarChart, BlockChart };
