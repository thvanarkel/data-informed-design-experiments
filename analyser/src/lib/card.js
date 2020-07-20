var {
	LineChart,
	BlockChart
} = require("./chart.js");

module.exports = class Card {
	constructor(title, type, data) {
		this.title = title;
		this.data = data;
		this.type = type

		this.create();
	}

	create() {
		var container = document.getElementsByClassName('card-stack')[0];
		this.card = document.createElement('div');
		this.card.className = "card"
		container.appendChild(this.card);

		if (this.type === 'line') this.chart = new LineChart(this.card, this.data, 200, this.title)
		if (this.type === 'block') this.chart = new BlockChart(this.card, this.data, 100, this.title)
	}
}