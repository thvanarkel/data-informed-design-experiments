//#include <Wire.h>
//#include <Digital_Light_ISL29035.h>
//#include <Digital_Light_TSL2561.h>

#include <ArduinoBLE.h>

//#include <WiFiNINA.h>
//#include <MQTTClient.h>

//#include "arduino_secrets.h"

// CONFIGURATION
//#define DIGITAL_LIGHT
//#define SOUND
//  #define SOUND_PIN A0

//char ssid[] = SECRET_SSID;
//char pass[] = SECRET_PASS;

// Variables
//WiFiClient net;
//MQTTClient client;

BLEService lightService("7a9b4b66-362f-11ea-978f-2e728ce88125");

BLEIntCharacteristic lightLevelChar("7a9b4b66-362f-11ea-978f-2e728ce88125", BLERead | BLENotify);

int oldLightLevel = 0;
long previousMillis = 0;

unsigned long lastMillis = 0;


void setup()
{
  
//  Wire.begin();
  Serial.begin(9600);
  while(!Serial);
  Serial.println("begin");
//  WiFi.begin(ssid, pass);
//  TSL2561.init();

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

//  client.begin("broker.shiftr.io", net);

//  connect();
}

//void connect() {
//  Serial.println("checking wifi...");
//  while (WiFi.status() != WL_CONNECTED) {
//    Serial.print(".");
//    delay(1000);
//  }
//  Serial.print("\nconnecting...");
//  while (!client.connect("probe", SECRET_USERNAME, SECRET_PASSWORD)) {
//    Serial.print(".");
//    delay(1000);
//  }
//
//  Serial.println("\nconnected!");
//
//  client.subscribe("/hello");
//}

void loop()
{
  BLEDevice central = BLE.central();

  if(central) {
    Serial.println("Connected to central: ");
    Serial.println(central.address());
    while(central.connected()) {
      if (millis() - previousMillis >= 1000) {
        previousMillis = millis();
        updateLightValue();
      }
    }
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }

  
//  client.loop();
//  delay(10);  // <- fixes some issues with WiFi stability
//  if (!client.connected()) {
//    connect();
//  }

//  if (millis() - lastMillis > 2000) {
//    lastMillis = millis();
//  } else {
//    return;
//  }
  
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
  int lightLevel = random(1023);//TSL2561.readVisibleLux();
  if (lightLevel != oldLightLevel) {
    Serial.print("Light level is: ");
    Serial.println(lightLevel);
    lightLevelChar.writeValue(lightLevel);
    oldLightLevel = lightLevel;
  }
}
