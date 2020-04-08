fs = require('fs');

module.exports = {
	createConfig: (session, thing) => {
		var data = "";

		data += `// configuration for ${thing.name} in session ${session.id} \n`;
		data += `\n// network connection \n#define SECRET_SSID "${session.credentials.ssid}" \n#define SECRET_PASS "${session.credentials.password}" \n`;

		data += `\n\n// host configuration \n#define HOST_NAME "${session.host.hostname}" \n#define SECRET_USERNAME "${session.host.username}" \n#define SECRET_PASSWORD "${session.host.password}" \n`

		data += `\n// thing configuration \n#define THING_NAME "${thing.name}"\n`

		for (level of thing.debugLevels) {
			data += "\n"
			if (level === 'audio') {
				data += "#define DEBUG_AUDIO";
			} else if (level === 'message') {
				data += "#define DEBUG_MESSAGE";
			}
		}

		for (sensor of thing.sensors) {
			data += '\n'
			const u = sensor.name.toUpperCase();
			// Add name
			if (sensor.name === 'light') { // Exception for light sensor
				const t = sensor.config.type.toUpperCase();
				data += `#define ${t}_${u}`
			} else {
				data += `#define ${u}`
			}
			data += '\n'
			data += ` #define ${u}_SAMPLING_INTERVAL ${sensor.config.interval}`
			if (sensor.name === 'motion') { // Exception for motion sensor
				data += '\n'
				if (sensor.config.type === 'analog') {
					data += ` #define ${u}_PIN A0`
				} else if (sensor.config.type === 'digital') {
					data += ` #define ${u}_PIN 5`
				}
			}
			if (sensor.name === 'sound') { // Exception for sound sensor
				data += '\n'
				data += ` #define ${u}_BASELINE ${sensor.config.baseline}`
			}
		}

		return new Promise((resolve, reject) => {
			fs.writeFile('probe/configuration.h', data, function(err) {
				if (err) return console.log(err);
				resolve(data);
			});
		});

	},
	createSessionLog: (session) => {
		return new Promise((resolve, reject) => {
			fs.writeFile(`session-${session.id}.json`, JSON.stringify(session), function(err) {
				if (err) return console.log(err);
				resolve(session);
			});
		});
	},
	readSession: (path) => {
		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, data) => {
				if (err) return console.error(err)
				resolve(JSON.parse(data))
			})
		})
	}
}