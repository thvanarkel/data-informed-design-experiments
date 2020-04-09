#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const inquirer = require('./lib/inquirer');
const writer = require('./lib/writer');
const compiler = require('./lib/compiler');

var session = {};

var editMode = false;
var sessionFilePath;

clear();

console.log(
	chalk.cyan(
		figlet.textSync('probe', {
			font: 'isometric3',
			horizontalLayout: 'full'
		})
	)
);

console.log(
	chalk.cyan(
		figlet.textSync(' -configurator- ', {
			font: 'cybermedium',
			horizontalLayout: 'full'
		})
	)
);

const run = async () => {
	console.log("Hello there! 👋");

	var argv = require('minimist')(process.argv.slice(2));
	var path = argv.s
	var review = true;
	if ('s' in argv) {
		sessionFilePath = argv.s
		let s = await writer.readSession(sessionFilePath);
		session = s;
		editMode = true;
		console.log("Loaded a session file!")
		review = (await inquirer.reviewSession()).review;
	} else {
		console.log("Let's start by configuring the information for this session.");
	}
	/*
	 *  Ask for session details
	 */
	if (review) {
		const id = await inquirer.askSessionDetails(session);
		session.id = id.id;
		const credentials = await inquirer.askWiFiCredentials(session);
		session.credentials = credentials;
		const hostDetails = await inquirer.askHostDetails(session);
		session.host = hostDetails;
	}

	/*
	 *  Configure things
	 */
	console.log("\nGreat, now we move on to configuring the things!");
	var allSet = false;
	if (editMode) {
		const edit = await inquirer.editThings(session.things);
		for (t of edit.things) {
			for (const [i, thing] of session.things.entries()) {
				if (thing.name !== t) continue;
				const answ = await inquirer.askThingName(session.things, thing, true);
				thing.name = answ.thing;

				const debugLevels = await inquirer.configureDebugLevels(thing);
				thing.debugLevels = debugLevels.levels;

				const newSensors = await inquirer.selectSensors(["sound", "light", "temperature", "motion", "time_of_flight", "human_presence", "accelerometer", "gyroscope"], thing);

				for (s of newSensors.s) {
					var present = false
					for (sC of thing.sensors) {
						if (s === sC.name) {
							present = true;
						}
					}
					if (!present) {
						thing.sensors.push({
							name: s,
							config: {}
						})
					}
				}

				for (const [i, sensor] of thing.sensors.entries()) {
					var t = false;
					var b = false;
					switch (sensor.name) {
						case 'sound':
							b = true;
							break;
						case 'light':
							t = true;
							break;
						case 'motion':
							t = true;
							break;
					}
					const config = await inquirer.askSensorConfig(sensor.name, t, b, sensor.config);
					sensor.config = config;
					thing.sensors[i] = sensor;
				}
				session.things[i] = thing;

				await compile(thing);
			}
		}

		// ask whether to add a new one
		// Check if the user wants to configure another probe
		const a = await inquirer.askIfAllSet();
		allSet = a.type;

	} else {
		session.things = [];
	}

	/*
	 * 	Add new things
	 */
	while (!allSet) {
		var thing = {};

		const answ = await inquirer.askThingName(session.things);
		thing.name = answ.thing;

		const debugLevels = await inquirer.configureDebugLevels();
		thing.debugLevels = debugLevels.levels;

		const sensors = await inquirer.selectSensors(["sound", "light", "temperature", "motion", "time_of_flight", "human_presence", "accelerometer", "gyroscope"]);
		thing.sensors = [];
		for (sensor of sensors.s) {
			var sensor = {
				name: sensor
			};
			var t = false;
			var b = false;
			switch (sensor.name) {
				case 'sound':
					b = true;
					break;
				case 'light':
					t = true;
					break;
				case 'motion':
					t = true;
					break;
			}
			const config = await inquirer.askSensorConfig(sensor.name, t, b);
			sensor.config = config;
			thing.sensors.push(sensor);
		}
		session.things.push(thing);

		await compile(thing);

		// Check if the user wants to configure another probe
		const a = await inquirer.askIfAllSet();
		allSet = a.type;

	}
	// TODO: write the session configuration to to to disk
	var log = await writer.createSessionLog(session);
	console.log("Wrote the logfile, goodbye! 👋")
};

const compile = async (thing) => {
	const file = await writer.createConfig(session, thing);

	console.log("Connect the probe to the computer");

	const port = await compiler.lookForProbe();
	console.log(`Found probe at ${port}`);
	const uploaded = await compiler.uploadFirmware(port)
	console.log(`Succesfully uploaded firmware to probe for ${thing.name}`)
	console.log("You can disconnect the probe now!\n")
	return;
}

run();