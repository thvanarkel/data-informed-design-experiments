#include <Wire.h>
#include <Digital_Light_ISL29035.h>
#include <Digital_Light_TSL2561.h>

#include <WiFiNINA.h>
#include <MQTTClient.h>

#include "arduino_secrets.h"

// CONFIGURATION
#define DIGITAL_LIGHT
#define SOUND
  #define SOUND_PIN A0

char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;

// Variables
WiFiClient net;
MQTTClient client;

unsigned long lastMillis = 0;


void setup()
{
  Wire.begin();
  Serial.begin(9600);
  WiFi.begin(ssid, pass);
  TSL2561.init();

  client.begin("broker.shiftr.io", net);

  connect();
}

void connect() {
  Serial.println("checking wifi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.print("\nconnecting...");
  while (!client.connect("probe", SECRET_USERNAME, SECRET_PASSWORD)) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nconnected!");

  client.subscribe("/hello");
}

void loop()
{
  client.loop();
  delay(10);  // <- fixes some issues with WiFi stability
  if (!client.connected()) {
    connect();
  }

  if (millis() - lastMillis > 1000) {
    lastMillis = millis();
  } else {
    return;
  }
  
  #ifdef DIGITAL_LIGHT
  Serial.print("The Light value is: ");
  int lightValue = TSL2561.readVisibleLux();
  Serial.println(lightValue);
  client.publish("/light", String(lightValue));
  #endif

  #ifdef SOUND
  int soundValue = analogRead(SOUND_PIN);
  client.publish("/sound", String(soundValue));
  Serial.println(soundValue);
  #endif
 
}
