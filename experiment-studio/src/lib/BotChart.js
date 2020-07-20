import React, { Component } from 'react';
import * as d3 from 'd3';
import moment from 'moment'

class BotChart extends Component {
  constructor(props) {
    super(props);
		this.state = {
			data: this.parseData(props.data),
		}
  }

  parseData(d) {
		for (const e of d) {
			e._original = e._time
			e._time = new Date(e._time)
		}
		return d;
	}

  componentDidMount() {
		this.container = d3.select('#graph-' + this.props.index ).append("div").attr("class", "messages")
			// .attr("width", this.width + this.margin.left + this.margin.right)
			// .attr("height", this.height + this.margin.top + this.margin.bottom)
			// .append("g")
			// .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
    this.drawChart();
  }

  drawChart() {
    const filteredData = this.state.data.filter((d) => d._field === "value")
    const sortedData = filteredData.sort((a, b) =>  a._time - b._time)

    console.log(sortedData);
    this.container.selectAll("messages")
      .data(sortedData)
      .enter()
      .append("div")
      .attr("class", function(d) {
        return d.sender === "bot" ? "message bot" : "message user"
      })
      .append("p")
      .attr("class", "message-text")
      .text(function(d, i) {
        return d._value;
      })
      .append("p")
      .attr("class", "message-time")
      .text(function(d, i) {
        return moment(d._original).format("HH:mm");
      })
      .style()

    // this.container.append("p")
    //   .text("Hello, world!")
  }

  render(){
    return (
			<div className="graph" id={"graph-" + this.props.index}></div>
		)
  }
}

export { BotChart };
