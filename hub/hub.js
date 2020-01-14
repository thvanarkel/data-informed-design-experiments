var noble = require('@abandonware/noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
	console.log('Found device with local name: ' + peripheral.advertisement.localName);
	console.log('advertising the following service uuid\s: ' + peripheral.advertisement.serviceUuids);
	console.log();
});
