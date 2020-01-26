#include <Wire.h>
#include <Digital_Light_TSL2561.h>
#include <Reactduino.h>
#include <WiFiNINA.h>
#include <MQTT.h>
#include <I2S.h>

#include "arduino_secrets.h"

const char ssid[] = SECRET_SSID;
const char pass[] = SECRET_PASS;

WiFiClient net;
MQTTClient client;

// CONFIGURATION
#define DIGITAL_LIGHT
#define MICROPHONE
#define MOTION
  #define MOTION_PIN 5

#ifdef DIGITAL_LIGHT
int oldLightLevel = 0;

void sampleLight() {
  int lightLevel = TSL2561.readVisibleLux();
//  if (lightLevel != oldLightLevel) {
    Serial.print("Light level is: ");
    Serial.println(lightLevel);
    client.publish("/light", String(lightLevel));
    oldLightLevel = lightLevel;
//  }
}
#endif

#ifdef MICROPHONE
struct SoundSample {
  int minimum;
  int maximum;
  int average;
};

void sampleSound() {
  unsigned long lastMillis = millis();
  SoundSample theSample;
  long total = 0;
  long measurements = 0;
  while (millis() - lastMillis < 500) {
    int delta = sample();
    theSample.minimum = min(theSample.minimum, delta);
    theSample.maximum = max(theSample.maximum, delta);
    total += delta;
    measurements++;
  }
  theSample.average = total/measurements;
  client.publish("/sound/minimum", String(theSample.minimum));
  client.publish("/sound/maximum", String(theSample.maximum));
  client.publish("/sound/average", String(theSample.average));
}

#define SAMPLES 128 // make it a power of two for best DMA performance

int sample() {
  // read a bunch of samples:
  int samples[SAMPLES];
 
  for (int i=0; i<SAMPLES; i++) {
    int sample = 0; 
    while ((sample == 0) || (sample == -1) ) {
      sample = I2S.read();
    }
    // convert to 18 bit signed
    sample >>= 14; 
    samples[i] = sample;
  }
 
  // ok we have the samples, get the mean (avg)
  float meanval = 0;
  for (int i=0; i<SAMPLES; i++) {
    meanval += samples[i];
  }
  meanval /= SAMPLES;
  
  // subtract it from all sapmles to get a 'normalized' output
  for (int i=0; i<SAMPLES; i++) {
    samples[i] -= meanval;
  }
  // find the 'peak to peak' max
  float maxsample, minsample;
  minsample = 100000;
  maxsample = -100000;
  for (int i=0; i<SAMPLES; i++) {
    minsample = min(minsample, samples[i]);
    maxsample = max(maxsample, samples[i]);
  }
//  Serial.print(maxsample - minsample);
//  Serial.print(" ");
  return (maxsample - minsample);
}
#endif

#ifdef MOTION
void sampleMotion() {
  int val = digitalRead(MOTION_PIN);
  client.publish("/motion", String(val));
}
#endif

void loop_main() {
  client.loop();

  if (!client.connected()) {
    connect();
  }
}

void app_main() {
  Serial.begin(9600);
  WiFi.begin(ssid, pass);
  client.begin("broker.shiftr.io", net);
  connect();

  #ifdef DIGITAL_LIGHT
  Wire.begin();
  TSL2561.init();
  app.repeat(30000, sampleLight);
  #endif
  
  #ifdef MICROPHONE
  if (!I2S.begin(I2S_PHILIPS_MODE, 16000, 32)) {
    Serial.println("Failed to initialize I2S!");
    while (1); // do nothing
  }
  app.repeat(1000, sampleSound);
  #endif

  #ifdef MOTION
  app.repeat(10000, sampleMotion);
  #endif
  
  app.onTick(loop_main);
}

Reactduino app(app_main);

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
