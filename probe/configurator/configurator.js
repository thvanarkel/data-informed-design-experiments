const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const CLI = require('clui');
const inquirer = require('./lib/inquirer');
const writer = require('./lib/writer');
const compiler = require('./lib/compiler');




clear();

const session = {};
const Spinner = CLI.Spinner;

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

	// TODO: Configure the directory of the probe sketch here, and the directory for writing the config file

	/*
	 *  Ask for session details
	 */
	// console.log("Let's start by configuring the information for this session.");
	// const id = await inquirer.askSessionDetails();
	// session.id = id.id;
	// const credentials = await inquirer.askWiFiCredentials();
	// session.credentials = credentials;
	// const hostDetails = await inquirer.askHostDetails(session.id);
	// session.host = hostDetails;
	// const debugLevels = await inquirer.configureDebugLevels();
	// session.debugLevels = debugLevels.levels;
	// console.log(session);

	/*
	 *  Configure things
	 */
	console.log("Great, now we move on to configuring the things!");
	var allSet = false;
	session.things = [];
	while (!allSet) {
		// var thing = {};
		// const answ = await inquirer.askThingName(session.things);
		// thing.name = answ.thing;
		// const sensors = await inquirer.selectSensors(["sound", "light", "temperature", "motion", "time_of_flight", "human_presence", "accelerometer", "gyroscope"]);
		// thing.sensors = [];
		// for (sensor of sensors.s) {
		// 	// TODO: iterate over sensors for their configuration
		// 	var sensor = {
		// 		name: sensor
		// 	};
		// 	var t = false;
		// 	var b = false;
		// 	switch (sensor.name) {
		// 		case 'sound':
		// 			b = true;
		// 			break;
		// 		case 'light':
		// 			t = true;
		// 			break;
		// 		case 'motion':
		// 			t = true;
		// 			break;
		// 	}
		// 	const config = await inquirer.askSensorConfig(sensor.name, t, b);
		// 	sensor.config = config;
		// 	thing.sensors.push(sensor);

			// TODO: write the configuration to to to disk

			// TODO: compile the probe
      console.log("Connect the probe to the computer");
      var status = new Spinner('🤖 Looking for probe....');
      status.start();

      const port = await compiler.lookForProbe();
      status.stop();
      console.log(`Found probe at ${port}`);
      compiler.uploadFirmware(port)


			// Check if the user wants to configure another probe
			allSet = await inquirer.askIfAllSet();
		}
		session.things.push(thing);
		console.log(session);
		// TODO: write the session configuration to to to disk


//}

};

run();

// ports = [];

// exec("serialport-list", (error, stdout, stderr) => {
//   if (error) {
//     console.log(`error: ${error.message}`);
//     return;
//   }
//   if (stderr) {
//     console.log(`stderr: ${stderr}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
// });
// const f = async () => {
//   const ports = await SerialPort.list()
//   console.log(ports)
// }
// f()
