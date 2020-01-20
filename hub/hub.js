var noble = require('@abandonware/noble');

console.log("Started")
console.log("Nothing showing up? Run the program as 'sudo node hub.js'");

noble.on('stateChange', function(state) {
  console.log(state);
  if (state === 'poweredOn') {
	console.log("scanning...");
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  peripheral.connect();
  console.log('peripheral discovered (' + peripheral.id +
              ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
              ' connectable ' + peripheral.connectable + ',' +
              ' RSSI ' + peripheral.rssi + ':');
  console.log('\thello my local name is:');
  console.log('\t\t' + peripheral.advertisement.localName);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));

  var serviceData = peripheral.advertisement.serviceData;
  if (serviceData && serviceData.length) {
    console.log('\there is my service data:');
    for (var i in serviceData) {
      console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
    }
  }

  console.log();
});
