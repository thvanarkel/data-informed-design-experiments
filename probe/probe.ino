#include <Wire.h>
#include <Digital_Light_TSL2561.h>

#include <ArduinoBLE.h>

// CONFIGURATION
//#define DIGITAL_LIGHT
//#define SOUND
//  #define SOUND_PIN A0

BLEService lightService("7a9b4b66-362f-11ea-978f-2e728ce88125");

BLEIntCharacteristic lightLevelChar("7a9b4b66-362f-11ea-978f-2e728ce88125", BLERead | BLENotify);

int oldLightLevel = 0;
long previousMillis = 0;

unsigned long lastMillis = 0;

void setup()
{
  Serial.begin(9600);
  while(!Serial);
  Serial.println("begin");

  if(!BLE.begin()) {
    Serial.println("Cannot start BLE");
    while(1);
  }

  BLE.setLocalName("LED");
  BLE.setAdvertisedService(lightService);
  lightService.addCharacteristic(lightLevelChar);
  BLE.addService(lightService);
  lightLevelChar.writeValue(oldLightLevel);

  BLE.advertise();

  Serial.println("Bluetooth device active, waiting for connections");

  Wire.begin();
  TSL2561.init();
}

void loop()
{
  BLEDevice central = BLE.central();

  if(central) {
    Serial.println("Connected to central: ");
    Serial.println(central.address());
    while(central.connected()) {
      if (millis() >= previousMillis + 1000) {
        previousMillis = millis();
        updateLightValue();
      }
    }
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }

  if (millis() >= previousMillis + 1000) {
     previousMillis = millis();
     updateLightValue();
  }
  
  #ifdef DIGITAL_LIGHT
  Serial.print("The Light value is: ");
  int lightValue = TSL2561.readVisibleLux();
  Serial.println(lightValue);
  client.publish("/light", String(lightValue));
  #endif

  #ifdef SOUND
  unsigned long startTime = millis();
  const int sampleTime = 100;
  unsigned long total = 0;
  int numMeasurements = 0;
  while (millis() - startTime < sampleTime) {
    int sensorValue = analogRead(SOUND_PIN);
    total += sensorValue;
    numMeasurements++;
  }
  int sensorAverage = total / numMeasurements;
  client.publish("/sound", String((sensorAverage+83.2073) / 11.003));
  Serial.println((sensorAverage+83.2073) / 11.003);
  #endif
 
}

void updateLightValue() {
  int lightLevel = TSL2561.readVisibleLux();
  if (lightLevel != oldLightLevel) {
    Serial.print("Light level is: ");
    Serial.println(lightLevel);
    lightLevelChar.writeValue(lightLevel);
    oldLightLevel = lightLevel;
  }
}
