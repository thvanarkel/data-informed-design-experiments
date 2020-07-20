import React, { Component } from 'react';
import * as d3 from 'd3';
import moment from 'moment'
import loadedData from './data'

const data = loadedData.session1;

const min = moment("18:30", "HH:mm")
const max = moment("12:00", "HH:mm").add(1, 'd')

const { dialog } = require('electron').remote
var fs = require("fs");

const white =           "#FFFFFF";
const dark =            "#00004C";
const grey1 =           "#F3F3F6";
const grey2 =           "#E2E2E9";
const grey3 =           "#C9C9D4";
const grey4 =           "#B5B5BF";
const grey5 =           "#797986";
const grey6 =           "#4C4C57";

const purple =          "#715CF9";
const purplelight =     "#F0F0FE";
const blue =            "#23B2FE";
const darkblue =        "#2361fe";
const bluelight =       "#E9F7FE";
const green =           "#00D692";
const greenlight =      "#E9FBF4";
const yellow =          "#FEBC2D";
const yellowLight =     "#ffdf99";
const orange =          "#fe992d";
const yellowlight =     "#FFF8EC";
const red =             "#E4525A";
const redlight =        "#FCEEEF";
const magenta =         "#DD0C75";
const magentalight =   "#FBE8F1";
const peach =           "#FF6577";
const peachlight =     "#FFF0F2";
const mauve =           "#B56EF5";
const mauvelight =     "#F3E6FD";




for (const day of data) {
  var activities = day.activities;
  for (var a of activities) {
    a.start = moment(a.start, "HH:mm")
    a.stop = moment(a.stop, "HH:mm")
    if (a.start.isBetween(moment('0:00', "HH:mm"), min, undefined, "[)]")) {
      a.start.add(1, 'd')
    }
    if (a.stop.isBetween(moment('0:00', "HH:mm"), min, 'minute', "[)")) {
      a.stop.add(1, 'd')
    }
  }
}

const durations = []

var i = 0;
for (const day of data) {
  var m = 0;

  for (var a of day.activities) {
    if (a.activity == activities.bedInactive) {
      m += a.stop.diff(a.start, 'minutes');
    }
  }

  if (i%7 != 4 && i%7 != 5) {
    durations.push({duration: m, index: `week ${Math.floor(i/7)+1}`})
  }
  i++
}
console.log(durations)


class OverviewChart extends Component {
  constructor(props) {
    super(props);
		this.state = {
			// data: this.parseData(props.data),
		}
    this.margin = {
			top: 20,
			right: 30,
			bottom: 30,
			left: 60
		};
    console.log(props.width)
    console.log(props.height)
		this.width = props.width - this.margin.left - this.margin.right;
		this.height = props.height - this.margin.top - this.margin.bottom;
  }

  // parseData(d) {
	// 	for (const e of d) {
	// 		e._original = e._time
	// 		e._time = new Date(e._time)
	// 	}
	// 	return d;
	// }

  componentDidMount() {
		this.svg = d3.select('#graph-' + this.props.index ).append("svg").attr("class", "chart")
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
      this.drawChart();
		}
		// this.update();
	}

  drawChart() {
    // const filteredData = this.state.data.filter((d) => d._field === "value")
    // const sortedData = filteredData.sort((a, b) =>  a._time - b._time)

    this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (data.length * 22 + 3*10) + ")")
			.attr("opacity", "0.3")

    this.updateXAxis();

    var lines = this.svg.selectAll('rect')
      .data(data)
      .enter()
      .append('g')
      .attr('class', function(d, i) {
        return `line-${i}`
      })
      .attr('transform', function(d, i) {
        var y = i * 22;
        var a = Math.floor((i-1)/7) * 10
        a += (i % 7 && i != 0) == 0 ? 10 : 0;
        return `translate(0, ${y + a})`
      })

      lines.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 20)
        .attr('width', this.width)
        .attr('fill', grey2)

      lines.append('g')
        .attr('class', 'blocks')

      lines.each((function(d, i) {
        var t = 0;
        var bar = d3.select(`.line-${i} > .blocks`).selectAll('rect')
        .data(d.activities)
        .enter()
        .append("g")
        bar.append('rect')
        .attr('x', (function(d, i) {
          return this.xScale(d.start);
        }).bind(this))
        .attr('y', 0)
        .attr('width', (function(d, i) {
          return this.xScale(d.stop) - this.xScale(d.start);
        }).bind(this))
        .attr('height', 20)
        .attr('rx', 0)
        .attr('fill', function(d, i) {
          return d.activity.color;
        })
        bar.append('text')
        .attr('x', (function(d, i) {
          return this.xScale(d.start) + 3;
        }).bind(this))
        .attr('y', 13)
        .text(function(d,i) {
          return d.activity.title
        })
        .attr("font-family", "Lars")
        .attr("fill", white)
        .attr("font-size", "10px")
      }).bind(this))
      lines.append("text")
      .attr("dx", -27)
      .attr("dy", 15)
      .attr("width", 30)
      .attr("fill", grey5)
      .attr("text-anchor", "end")
      .attr("font-family", "Lars")
      .text(function(d, i) {
        return d.day;
      })
      lines.append("text")
      .attr("dx", -15)
      .attr("dy", 15)
      .attr("width", 30)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-family", "Lars")
      .text(function(d, i) {
        return (i + 1);
      })





    // console.log(sortedData);
    // this.container.selectAll("messages")
    //   .data(sortedData)
    //   .enter()
    //   .append("div")
    //   .attr("class", function(d) {
    //     return d.sender === "bot" ? "message bot" : "message user"
    //   })
    //   .append("p")
    //   .attr("class", "message-text")
    //   .text(function(d, i) {
    //     return d._value;
    //   })
    //   .append("p")
    //   .attr("class", "message-time")
    //   .text(function(d, i) {
    //     return moment(d._original).format("HH:mm");
    //   })
    //   .style()

    // this.container.append("p")
    //   .text("Hello, world!")

		// this.updateYAxis();
  }

  updateXAxis() {
		this.xScale = d3.scaleTime()
			.domain([min.valueOf(), max.valueOf()]) // input
			.range([0, this.width]) // output

		this.xAxis = d3.axisBottom(this.xScale)
			.ticks(20)
			.tickFormat(d3.timeFormat("%H:%M"))

		this.svg.select('.x.axis')
			.call(this.xAxis)
	}

  render(){
    return (
      <div>
			<div className="graph" id={"graph-" + this.props.index}></div>
      <div className="boxplot" id={"box-" + this.props.index}></div>
      </div>
		)
  }

  export() {
		console.log("export!")
    var svgString = getSVGString(this.svg.node().parentNode);
    var path = dialog.showOpenDialogSync({ properties: ['openDirectory'] })

		path += `/overview-chart.svg`;

    // path += "/sensor-line" + ".svg"
    fs.writeFile(path, svgString, (err) => {
      // throws an error, you could also catch it here
    if (err) throw err;
      // success case, the file was saved
      console.log('Saved visual!');
    });
  }
}

export { OverviewChart };



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
