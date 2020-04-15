var {
	LineChart,
	BlockChart
} = require("./chart.js");

module.exports = class Card {
	constructor(title, data) {
		this.title = title;
		this.data = data;

		this.create();
	}

	create() {
		console.log(document)
		var container = document.getElementsByClassName('card-stack')[0];
		this.card = document.createElement('div');
		this.card.className = "card"
		container.appendChild(this.card);


		this.chart = new LineChart(this.card, this.data, 200, this.title)
	}
}