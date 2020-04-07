const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');

clear();

const session = {};

console.log(
  chalk.cyan(
    figlet.textSync('probe', { font: 'isometric3', horizontalLayout: 'full' })
  )
);

console.log(
  chalk.cyan(
    figlet.textSync(' -configurator- ', { font: 'cybermedium', horizontalLayout: 'full' })
  )
);


const run = async () => {
  console.log("Hello there! 👋");

  // TODO: Configure the directory of the probe sketch here, and the directory for writing the config file

  /*
   *  Ask for session details
   */
  console.log("Let's start by configuring the information for this session.");
  const id = await inquirer.askSessionDetails();
  session.id = id.id;
  const credentials = await inquirer.askWiFiCredentials();
  session.credentials = credentials;
  const hostDetails = await inquirer.askHostDetails(session.id);
  session.host = hostDetails;
  const debugLevels = await inquirer.configureDebugLevels();
  session.debugLevels = debugLevels.levels;
  console.log(session);

  /*
   *  Configure things
   */
  console.log("Let's start by configuring the information for this session.");

  const sensors = await inquirer.selectSensors([ "sound", "light", "temperature", "motion", "time_of_flight", "human_presence", "accelerometer", "gyroscope"]);
  console.log(sensors);
};

run();
