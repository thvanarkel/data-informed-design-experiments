#include <Wire.h>
#include <Digital_Light_TSL2561.h>
#include <Reactduino.h>
#include <WiFiNINA.h>
#include <MQTT.h>
#include <I2S.h>
#include <movingAvg.h>

#include "arduino_secrets.h"

const char ssid[] = SECRET_SSID;
const char pass[] = SECRET_PASS;

WiFiClient net;
MQTTClient client;

// CONFIGURATION
#define THING_NAME "bed"

#define DIGITAL_LIGHT
#define LIGHT_SAMPLING_INTERVAL 8000
#define MICROPHONE
#define MICROPHONE_BASELINE 7200
#define SOUND_SAMPLING_INTERVAL 1000
#define MOTION
#define MOTION_PIN 5
#define MOTION_SAMPLING_INTERVAL 2000

#ifdef DIGITAL_LIGHT
int oldLightLevel = 0;

void sampleLight() {
  int lightLevel = TSL2561.readVisibleLux();
  //  if (lightLevel != oldLightLevel) {
//  Serial.print("/light: ");
//  Serial.println(lightLevel);
  publishMessage("/light", String(lightLevel));
  oldLightLevel = lightLevel;
  //  }
}
#endif

#ifdef MICROPHONE

movingAvg level(128);

void sampleSound() {
//  Serial.println("sample sound");
//  unsigned long lastMillis = millis();
//  long total = 0;
//  long measurements = 0;
//  int minimum = 100000;
//  int maximum = -100000;
//  int average = 0;
//  while (millis() - lastMillis < 500) {
//    int delta = sample(); 
//    minimum = min(minimum, delta);
//    maximum = max(maximum, delta);
//    total += delta;
//    measurements++;
//  }
  //  Serial.println(measurements);
//  average = total / measurements; // Make sure it doesn't divide by 0!
  //  Serial.print("/sound/minimum: ");
  //  Serial.print(minimum);
  //  Serial.print(" ");
//  publishMessage("/sound/minimum", String(minimum));
  //  Serial.print("/sound/average: ");
  //  Serial.print(average);
  publishMessage("/sound/average", String(level.getAvg()));
  //  Serial.print("/sound/maximum: ");
  //  Serial.println(maximum);
//  publishMessage("/sound/maximum", String(maximum));
}


#define SAMPLES 128 // make it a power of two for best DMA performance

#define I2S_BUFFER_SIZE 512
uint8_t buffer[I2S_BUFFER_SIZE];
#define I2S_BITS_PER_SAMPLE 32
int *I2Svalues = (int *) buffer;

boolean printout = true;

int sample() {
  // read a bunch of samples:
  int samples[SAMPLES];
  int nSamples = 0;
  int maxsample = -100000;
  int minsample = 1000000;

//  for (int i = 0; i < SAMPLES; i++) {
//    int sample = 0;
//    int ticks = 0;
//    while ((sample == 0) || (sample == -1) ) {
  
//  I2S.flush();
  while (nSamples < SAMPLES) {
    I2S.read(buffer, I2S_BUFFER_SIZE);
    for (int i = 0; i < I2S_BITS_PER_SAMPLE; i++) {
      if ((I2Svalues[i]!= 0) && (I2Svalues[i] != -1)) {
        I2Svalues[i] >>= 14;
        if (nSamples < SAMPLES) {
//          Serial.println(samples[i]);
          samples[nSamples] = I2Svalues[i];
        }
        nSamples++;
      }
    }
    
  }
  float meanval;
  for (int i = 0; i < SAMPLES; i++) {
    
    meanval += samples[i];
  }
  meanval /= SAMPLES;
  for (int i = 0; i < SAMPLES; i++) {
     samples[i] += meanval;
  }
  for (int i = 0; i < SAMPLES; i++) {
     minsample = min(minsample, samples[i]);
     maxsample = max(maxsample, samples[i]);
  }

  
  Serial.print(maxsample - minsample);
  Serial.print(" ");
  Serial.println(level.getAvg());
//  Serial.print(" ");
//  Serial.print(abs(maxsample));
//  Serial.print(" ");
//  Serial.println(abs(minsample);
  

//  // ok we have the samples, get the mean (avg)
//  float meanval = 0;
//  for (int i = 0; i < SAMPLES; i++) {
//    meanval += samples[i];
//  }
//  meanval /= SAMPLES;
//  // subtract it from all sapmles to get a 'normalized' output
//  for (int i = 0; i < SAMPLES; i++) {
//    samples[i] -= meanval;
//  }
//  // find the 'peak to peak' max
//  float maxsample, minsample;
//  minsample = 100000;
//  maxsample = -100000;
//  for (int i = 0; i < SAMPLES; i++) {
//    minsample = min(minsample, samples[i]);
//    maxsample = max(maxsample, samples[i]);
//  }
//  Serial.print(maxsample - minsample);
//  Serial.print(" ");
  return (maxsample - minsample);
}
#endif

#ifdef MOTION
void sampleMotion() {
  int val = digitalRead(MOTION_PIN);
//  Serial.print("/motion: ");
//  Serial.println(val);
  publishMessage("/motion", String(val));
}
#endif

void loop_main() {
  client.loop();

  if (!client.connected()) {
    connect();
  }
  //  int delta = sample();
  //  Serial.println(delta);
  #ifdef MICROPHONE;
  int reading = sample() - MICROPHONE_BASELINE;
  level.reading(reading);
//  Serial.print(reading);
//  Serial.print(" ");
//  Serial.println(level.getAvg());
  #endif;
}

void app_main() {
  Serial.begin(115200);
  WiFi.begin(ssid, pass);
  client.begin("broker.shiftr.io", net);
  connect();

#ifdef DIGITAL_LIGHT
  Wire.begin();
  TSL2561.init();
  app.repeat(LIGHT_SAMPLING_INTERVAL, sampleLight);
#endif

#ifdef MICROPHONE
  level.begin();
  if (!I2S.begin(I2S_PHILIPS_MODE, 16000, 32)) {
    Serial.println("Failed to initialize I2S!");
    while (1); // do nothing
  }
  app.repeat(SOUND_SAMPLING_INTERVAL, sampleSound);
#endif

#ifdef MOTION
  app.repeat(MOTION_SAMPLING_INTERVAL, sampleMotion);
#endif

  app.onTick(loop_main);
}

Reactduino app(app_main);

void publishMessage(String topic, String payload) {
  client.publish(String("/") + THING_NAME + topic, payload);
}

void connect() {
  Serial.print("checking wifi...");
  int ticks;
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    ticks++;
    delay(1000);
    if (ticks > 5) {
      WiFi.begin(ssid, pass);
      ticks = 0;
    }
  }

  Serial.print("\nconnecting...");
  while (!client.connect(THING_NAME, SECRET_USERNAME, SECRET_PASSWORD)) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nconnected!");

  // client.unsubscribe("/hello");
}
