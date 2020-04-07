const inquirer = require('inquirer');

module.exports = {
  askWiFiCredentials: () => {
    const questions = [{
        name: 'ssid',
        type: 'input',
        message: 'What is the SSID name:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your username or e-mail address.';
          }
        }
      },
      {
        name: 'ssid-pass',
        type: 'password',
        message: 'What is the SSID password:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your password.';
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
