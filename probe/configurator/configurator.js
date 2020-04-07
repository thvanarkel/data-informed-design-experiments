const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');

clear();

const session = {};

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
		var thing = {};
    const answ = await inquirer.askThingName(session.things);
    thing.name = answ.thing;
    const sensors = await inquirer.selectSensors(["sound", "light", "temperature", "motion", "time_of_flight", "human_presence", "accelerometer", "gyroscope"]);
    thing.sensors = [];
    for (sensor of sensors.s) {
      // TODO: iterate over sensors for their configuration
      var sensor = {name: sensor};
      var config;
      var t = false;
      var b = false;
      switch(sensor) {
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
      const config = await inquirer.askSensorConfig(sensor, t, b);
      sensor.config = config;
      thing.sensors.push(sensor);

      allSet = await inquirer.askIfAllSet();
    }
    session.things.push(thing);
    console.log(session);

    // TODO: write the configuration to to to disk
    // TODO: compile the probe
    // TODO: check if another probe should be added
	}

};

run();
