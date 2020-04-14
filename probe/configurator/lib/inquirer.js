const inquirer = require('inquirer');

function pad(n, width = 1, z = 0) {
	return (String(z).repeat(width) + String(n)).slice(String(n).length)
}

module.exports = {
	reviewSession: () => {
		const question = [{
			type: 'list',
			name: 'review',
			message: `Do you want to review the session configuration or move over to configuring probes?`,
			choices: ['Review configuration', 'Configure probes'],
			filter: function(value) {
				return (value === 'Review configuration') ? true : false;
			}
		}];
		return inquirer.prompt(question);
	},
	askSessionDetails: (session) => {

		const question = [{
			name: 'id',
			type: 'input',
			message: 'What is the session ID:',
			default: session && session.id,
			validate: function(value) {
				var valid = !isNaN(parseInt(value));
				return valid || 'Please enter a number';
			},
			filter: function(value) {
				return pad(value, 2);
			}
		}];
		return inquirer.prompt(question);
	},
	askWiFiCredentials: (session) => {
		const questions = [{
				name: 'ssid',
				type: 'input',
				message: 'What is the SSID name:',
				default: session.credentials && session.credentials.ssid,
				validate: function(value) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a SSID';
					}
				}
			},
			{
				name: 'password',
				type: 'input',
				message: 'What is the SSID password:',
				default: session.credentials && session.credentials.password,
				validate: function(value) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a password.';
					}
				}
			}
		];
		return inquirer.prompt(questions);
	},
	askHostDetails: (session) => {
		const questions = [{
				type: 'input',
				name: 'hostname',
				message: 'What is the host name:',
				default: `collector${session.id}`,
				validate: function(value) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a host name';
					}
				}
			},
			{
				name: 'username',
				type: 'input',
				message: 'What is the username for the host:',
				default: session.host && session.host.username,
				validate: function(value) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a username';
					}
				}
			},
			{
				name: 'password',
				type: 'input',
				message: 'What is the password for the host:',
				default: session.host && session.host.password,
				validate: function(value) {
					if (value.length) {
						return true;
					} else {
						return 'Please enter a password.';
					}
				}
			}
		]
		return inquirer.prompt(questions);
	},
	configureDebugLevels: (thing) => {
		levels = [];
		if (thing && thing.debugLevels) {
			for (el of thing.debugLevels) {
				if (el === 'audio') {
					levels.push('Raw audio values')
				} else if (el === 'message') {
					levels.push('All messages')
				}
			}
		}
		const questions = [{
			type: 'checkbox',
			name: 'levels',
			message: 'Select what should be output to the console',
			choices: ['Raw audio values', 'All messages'],
			default: levels,
			filter: function(value) {
				for (const [i, el] of value.entries()) {
					if (el === 'Raw audio values') {
						value[i] = 'audio'
					} else if (el === 'All messages') {
						value[i] = 'message'
					}
				}
				return value;
			}
		}];
		return inquirer.prompt(questions);
	},
	askThingName: (things, thing, edit) => {
		const question = [{
			name: 'thing',
			type: 'input',
			message: 'What is the name of the thing:',
			default: thing && thing.name,
			validate: function(value) {
				if (value.length) {
					if (thing && value === thing.name) {
						return true;
					}
					for (t of things) {
						if (value === t.name) {
							return 'Cannot have two things with the same name';
						}
					}
					return true;
				} else {
					return 'Please name the thing';
				}
			}
		}];
		return inquirer.prompt(question);
	},
	selectSensors: (sensors, thing) => {
		s = [];
		if (thing && thing.sensors) {
			for (sensor of thing.sensors) {
				s.push(sensor.name);
			}
		}
		const questions = [{
			type: 'checkbox',
			name: 's',
			message: 'Select the sensors connected to the probe:',
			choices: sensors,
			default: s,
			validate: function(value) {
				var valid = value.length > 0;
				return valid || 'Select at least one sensor';
			}
		}];
		return inquirer.prompt(questions);
	},
	askSensorConfig: (sensor, type, baseline, config) => {
		const questions = [];
		if (type) {
			questions.push({
				type: 'list',
				name: 'type',
				message: `Is ${sensor} connected to an analog or digital port:`,
				choices: ['analog', 'digital'],
				default: config && config.type
			})
		}
		if (baseline) {
			questions.push({
				type: 'input',
				name: 'baseline',
				message: `What is the baseline for ${sensor}:`,
				default: config && config.baseline,
				validate: function(value) {
					var valid = !isNaN(parseInt(value));
					return valid || 'Please enter a number';
				}
			});
		}
		questions.push({
			type: 'input',
			name: 'interval',
			message: `What is the sampling interval for ${sensor} (ms):`,
			default: config && config.interval,
			validate: function(value) {
				var valid = !isNaN(parseInt(value));
				return valid || 'Please enter a number';
			}
		});
		return inquirer.prompt(questions);
	},
	editThings: (things) => {
		const questions = [{
			type: 'checkbox',
			name: 'things',
			message: 'Select the things you want to edit (press enter to select none):',
			choices: things
		}];
		return inquirer.prompt(questions);
	},
	askIfAllSet: () => {
		const question = [{
			type: 'list',
			name: 'type',
			message: `Do you want to add another thing:`,
			choices: ['yes', 'no'],
			filter: function(value) {
				return (value === 'yes') ? false : true;
			}
		}];
		return inquirer.prompt(question);
	}
};