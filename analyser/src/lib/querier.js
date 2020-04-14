const {
	InfluxDB,
	Point,
	FluxTableMetaData
} = require('@influxdata/influxdb-client')

let queryApi;


module.exports = {
	config: (url, token, org) => {
		queryApi = new InfluxDB({
			url: url,
			token: token
		}).getQueryApi(org);
	},
	query: (q, f) => {
		return new Promise((resolve, reject) => {
			let data = [];
			queryApi.queryRows(q, {
				next(row, tableMeta) {
					let o = tableMeta.toObject(row);
					if (f && f.rowParser) {
						o = f.rowParser(o);
					}
					data.push(o);
				},
				error(error) {
					return console.log(error);
				},
				complete() {
					console.log('\nFinished SUCCESS');
					resolve(data)
				},
			});
		});
	}
}