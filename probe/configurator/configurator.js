const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');

clear();

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
  const credentials = await inquirer.askWiFiCredentials();
  console.log(credentials);
  const sensors = await inquirer.selectSensors(["motion", "temperature"]);
  console.log(sensors);
};

run();
