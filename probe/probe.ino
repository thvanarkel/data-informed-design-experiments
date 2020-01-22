#include <Wire.h>
#include <Digital_Light_TSL2561.h>

//#include <ArduinoBLE.h>
#include <WiFiNINA.h>
#include <MQTT.h>

#include "arduino_secrets.h"

const char ssid[] = SECRET_SSID;
const char pass[] = SECRET_PASS;

WiFiClient net;
MQTTClient client;

// CONFIGURATION
#define DIGITAL_LIGHT
//#define SOUND
//  #define SOUND_PIN A0


#ifdef DIGITAL_LIGHT
int oldLightLevel = 0;
#endif


long previousMillis = 0;

unsigned long lastMillis = 0;

void setup()
{
  Serial.begin(9600);
//  while(!Serial);
  Serial.println("begin");
  WiFi.begin(ssid, pass);
  
  client.begin("192.168.1.22", net);
  client.onMessage(messageReceived);

  connect();

  Wire.begin();
  TSL2561.init();
}

void connect() {
  Serial.print("checking wifi...");
  int ticks;
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    ticks++;
    delay(1000);
    if(ticks > 5) {
      WiFi.begin(ssid, pass);
      ticks = 0;
    }
  }

  Serial.print("\nconnecting...");
  while (!client.connect("arduino", SECRET_USERNAME, SECRET_PASSWORD)) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nconnected!");

  client.subscribe("/hello");
  // client.unsubscribe("/hello");
}

void loop()
{
  client.loop();

  if (!client.connected()) {
    connect();
  }
  
  #ifdef DIGITAL_LIGHT
  if (millis() > lastMillis + 1000) {
    lastMillis = millis();
    updateLightValue(); 
  }
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

void messageReceived(String &topic, String &payload) {
  Serial.println("incoming: " + topic + " - " + payload);
}

#ifdef DIGITAL_LIGHT
void updateLightValue() {
  int lightLevel = TSL2561.readVisibleLux();
  if (lightLevel != oldLightLevel) {
    Serial.print("Light level is: ");
    Serial.println(lightLevel);
    client.publish("/light", String(lightLevel));
    oldLightLevel = lightLevel;
  }
}
#endif
