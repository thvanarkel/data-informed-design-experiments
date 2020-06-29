import React, { Component } from 'react';
import * as d3 from 'd3';
import moment from 'moment'

const { dialog } = require('electron').remote
var fs = require("fs");

class Chart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: this.parseData(props.data),
		}
		this.margin = {
			top: 10,
			right: 10,
			bottom: 30,
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

		d3.select(this.svg.node().parentNode).append('line')
			.attr('x1', 0)
			.attr('x2', this.props.width)
			.attr('y1', this.props.height)
			.attr('y2', this.props.height)
			.attr('stroke-width', 3)
			.attr('stroke', "#000000")

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
		this.max = this.props.range !== undefined ? this.props.range.max : d3.max(this.state.data, d => d._value)
		this.yScale = d3.scaleLinear()
			.domain([0, this.max]) // input
			.range([this.height, 0]) // output
			.clamp(true)

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

	export() {
		console.log("export!")
    var svgString = getSVGString(this.svg.node().parentNode);
    var path = dialog.showOpenDialogSync({ properties: ['openDirectory'] })

		var d = moment(this.props.data[0]._start).format("YYYYMMDD")
		path += `/P1_${d}_${this.props.thing}_${this.props.measurement}_${this.props.window}` + ".svg";

    // path += "/sensor-line" + ".svg"
    fs.writeFile(path, svgString, (err) => {
      // throws an error, you could also catch it here
    if (err) throw err;
      // success case, the file was saved
      console.log('Saved visual!');
    });
  }
}

class LineChart extends Chart {
	constructor(props) {
		super(props)
	}

  drawChart() {
		super.drawChart();
		this.line = d3.line()
			.x((function(d, i) {
				return this.xScale(d._time);
			}).bind(this)) // set the x values for the line generator
			// .y0((function(d) {
			// 	return this.yScale(0);
			// }).bind(this))
			.y((function(d) {
				if (this.props.discrete) return (d._value < (0.25 * this.max) || d._value < 0.01) ? this.yScale(0) : this.yScale(1);
				return this.yScale(d._value)
			}).bind(this)) // set the y values for the line generator
			//.curve(d3.curveBasis) // apply smoothing to the line
			.curve(d3.curveLinear)

		// Name the SVG
		this.svg.attr('class', 'line-chart')

		this.svg.append("path")
			.attr("class", "line")
		this.update();
	}

	update() {
		super.update();
		this.svg.selectAll(".line")
			.datum(this.state.data) // 10. Binds data to the line
			.attr("class", "line") // Assign a class for styling
			.attr("d", this.line) // 11. Calls the line generator
			.attr('fill-opacity', '0')
			.attr('stroke-width', 2)
		}
}

class BlockChart extends Chart {
	constructor(props) {
		super(props)
	}

  drawChart() {
		super.drawChart();

		this.svg.attr('class', 'block-chart')

		console.log(this.props.gradient)
		this.colorScale = this.colorSchale();

		var bars = this.svg.selectAll('rect')
			.data(this.state.data)
			.enter()
			.append('rect')

		bars.attr('x', (function(d, i) {
				return this.xScale(d._time);
			}).bind(this))
			.attr('y', (function(d) {
				var v = d._value
				if (this.props.discrete) {
					v = (v < (0.25 * this.max) || d._value < 0.01) ? this.yScale(0) : this.yScale(1);
				}
				return this.props.fixedHeight ? 0 : 0.5 * (this.height - this.yScale(v));
			}).bind(this))
			.attr('height', (function(d) {
				var v = d._value
				if (this.props.discrete) {
					v = (v < (0.25 * this.max) || d._value < 0.01) ? this.yScale(0) : this.yScale(1);
					// console.log(v)
				} else {
					v = this.yScale(v);
				}
				return this.props.fixedHeight ? this.height : v;
			}).bind(this))
			.attr('width', 1)
			.attr('fill-opacity', (function(d) {
				return this.colorScale(d._value);
			}).bind(this))

		this.update();
	}

	updateYAxis() {
		this.max = this.props.range !== undefined ? this.props.range.max : d3.max(this.state.data, d => d._value)
		this.yScale = d3.scaleLinear()
			.domain([0, this.max]) // input
			.range([5, this.height]) // output
			.clamp(true)

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

		this.colorScale = this.colorSchale();


		this.svg.selectAll('rect')
			.attr('x', (function(d, i) {
				return this.xScale(d._time);
			}).bind(this))
			.attr('y', (function(d) {
				var v = d._value
				if (this.props.discrete) {
					v = (v < (0.25 * this.max) || d._value < 0.01) ? this.yScale(0) : this.yScale(1);
				}
				return this.props.fixedHeight ? 0 : 0.5 * (this.height - this.yScale(v));
			}).bind(this))
			.attr('height', (function(d) {
				var v = d._value
				if (this.props.discrete) {
					v = (v < (0.25 * this.max) || d._value < 0.01) ? this.yScale(0) : this.yScale(1);
				} else {
					v = this.yScale(v);
				}
				return this.props.fixedHeight ? this.height : v;
			}).bind(this))
			.attr('fill-opacity', (function(d) {
				return this.colorScale(d._value);
			}).bind(this))

			// .attr('fill-opacity', (function(d) {
			// 	return this.colorScale(d._value);
			// }).bind(this))
	}

	colorSchale() {
		let max = this.props.range !== undefined ? this.props.range.max : d3.max(this.state.data, d => d._value)
		let range = this.props.gradient !== undefined ? this.props.gradient : {min: 1.0, max: 1.0};
		return d3.scaleLinear()
			.domain([d3.min(this.state.data, d => d._value), max])
			.range([range.min, range.max]);
	}

}

export { LineChart, BlockChart };





// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString( svgNode ) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
	var cssStyleText = getCSSStyles( svgNode );
	appendCSS( cssStyleText, svgNode );

	var serializer = new XMLSerializer();
	var svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

	console.log(svgString);

	return svgString;

	function getCSSStyles( parentElement ) {
		var selectorTextArr = [];

		// Add Parent element Id and Classes to the list
		selectorTextArr.push( '#'+parentElement.id );
		for (var c = 0; c < parentElement.classList.length; c++)
				if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
					selectorTextArr.push( '.'+parentElement.classList[c] );

		// Add Children element Ids and Classes to the list
		var nodes = parentElement.getElementsByTagName("*");
		for (var i = 0; i < nodes.length; i++) {
			var id = nodes[i].id;
			if ( !contains('#'+id, selectorTextArr) )
				selectorTextArr.push( '#'+id );

			var classes = nodes[i].classList;
			for (var c = 0; c < classes.length; c++)
				if ( !contains('.'+classes[c], selectorTextArr) )
					selectorTextArr.push( '.'+classes[c] );
		}

		// Extract CSS Rules
		var extractedCSSText = "";
		for (var i = 0; i < document.styleSheets.length; i++) {
			var s = document.styleSheets[i];

			try {
			    if(!s.cssRules) continue;
			} catch( e ) {
		    		if(e.name !== 'SecurityError') throw e; // for Firefox
		    		continue;
		    	}

			var cssRules = s.cssRules;
			for (var r = 0; r < cssRules.length; r++) {
				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
					extractedCSSText += cssRules[r].cssText;
			}
		}


		return extractedCSSText;

		function contains(str,arr) {
			return arr.indexOf( str ) === -1 ? false : true;
		}

	}

	function appendCSS( cssText, element ) {
		var styleElement = document.createElement("style");
		styleElement.setAttribute("type","text/css");
		styleElement.innerHTML = cssText;
		var refNode = element.hasChildNodes() ? element.children[0] : null;
		element.insertBefore( styleElement, refNode );
	}
}
