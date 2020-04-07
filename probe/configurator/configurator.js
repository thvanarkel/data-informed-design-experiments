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
  console.log("Let's start by configuring the information for this session.");
  const id = await inquirer.askSessionDetails();
  session.id = id.id;
  console.log(session);
  const credentials = await inquirer.askWiFiCredentials();
  session.credentials = credentials;
  console.log(session);
  const sensors = await inquirer.selectSensors(["light", "motion", "temperature"]);
  console.log(sensors);
};

run();
