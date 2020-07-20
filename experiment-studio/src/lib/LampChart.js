import React, { Component } from 'react';
import * as d3 from 'd3';
import moment from 'moment'
import { Chart } from './Chart'

const { dialog } = require('electron').remote
var fs = require("fs");



class LampChart extends Chart {
	constructor(props) {
		super(props)
		this.margin = {
			top: 20,
			right: 15,
			bottom: 50,
			left: 30
		};
		this.hasYAxis = props.yAxis !== undefined ? props.yAxis : false;
		if (!this.hasYAxis) this.margin.left = 10;
		this.width = props.width - this.margin.left - this.margin.right;
		this.height = props.height - this.margin.top - this.margin.bottom;
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
				return this.yScale(d._value) - 2
			}).bind(this)) // set the y values for the line generator
			//.curve(d3.curveBasis) // apply smoothing to the line
			.curve(d3.curveLinear)

		// Name the SVG
		this.svg.attr('class', 'line-chart')

		this.svg.append("path")
			.attr("class", "line")

		// this.svg.append("g")
		// 	.attr("class", "markup")

		this.update();
	}

	update() {
		super.update();


		 // .attr("transform", (function(d, i) {
			//  return `translate(${this.xScale(d._time)},${this.yScale(0) - 4}) rotate(-90)`;
		 // }).bind(this))


		// circles.append('text')
		// 	.text("text")
		// 	.attr('dx', -20)
			// .attr('dy', 0)

		var data = this.state.data.filter(d => d._measurement === 'ledLevel')

		this.svg.selectAll(".line")
			.datum(data) // 10. Binds data to the line
			.attr("class", "line") // Assign a class for styling
			.attr("d", this.line) // 11. Calls the line generator
			.attr('fill-opacity', '0.1')
			// .attr('stroke-width', 1)
			// .attr('stroke', "black")
		}

		addAnnotation(data, c, color, y) {
			var alarm = this.svg.selectAll('.circles')
				// .append('g')
				.data(data)
				.enter()
				.append('circle')
				.attr('class', c)

			alarm
				.attr('cx', (function(d, i) {
					return this.xScale(d._time)
				}).bind(this))
				.attr('cy', (function(d, i) {
					return this.yScale(0);
				}).bind(this))
				.attr("r", 2)
				.attr("fill", color)

			this.svg.selectAll(".circles")
			 .data(data)
			 .enter()
			 .append("text")
			 // Add your code below this line
			 .text((d) => {
				 return d._value
			 })
			 .attr('dx', (function(d, i) {
				 return this.xScale(d._time)
			 }).bind(this))
			 .attr('dy', (function(d, i) {
				 return y;
			 }).bind(this))
			 .attr('font-size', "10px")
			 .attr("fill", color)

			 var lines = this.svg.selectAll('.circles')
				.data(data)
				.enter()
				.append('line')
				.attr('class', '.indicator-line')

			lines
				.attr('x1', (function(d, i) {
					return this.xScale(d._time)
				}).bind(this))
				.attr('x2', (function(d, i) {
					return this.xScale(d._time)
				}).bind(this))
				.attr('y1', (function(d, i) {
					return this.yScale(0);
				}).bind(this))
				.attr('y2', (function(d, i) {
					return y;
				}).bind(this))
				.attr("stroke-width", 0.25)
				.attr("stroke", color)
		}

		updateYAxis() {
			this.max = this.props.range !== undefined ? this.props.range.max : d3.max(this.state.data, d => d._value)
			this.yScale = d3.scaleLinear()
				.domain([0, 1000]) // input
				.range([this.height, 0]) // output
				.clamp(true)

			this.yAxis = d3.axisLeft(this.yScale)
				.ticks(5)

			this.svg.select('.y.axis')
				.call(this.yAxis)
		}
}

export { LampChart };





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
