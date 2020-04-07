const inquirer = require('inquirer');

function pad(n, width=1, z=0) {return (String(z).repeat(width) + String(n)).slice(String(n).length)}

module.exports = {
  askSessionDetails: () => {
    const question =[{
      name: 'id',
      type: 'input',
      message: 'What is the session ID:',
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
  askWiFiCredentials: () => {
    const questions = [{
        name: 'ssid',
        type: 'input',
        message: 'What is the SSID name:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter a SSID';
          }
        }
      },
      {
        name: 'ssidPass',
        type: 'password',
        message: 'What is the SSID password:',
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






  selectSensors: (sensors) => {
    const questions = [{
      type: 'checkbox',
      name: 'ignore',
      message: 'Select the files and/or folders you wish to ignore:',
      choices: sensors ,
      default: ['node_modules', 'bower_components']
    }];
    return inquirer.prompt(questions);
  }
};
