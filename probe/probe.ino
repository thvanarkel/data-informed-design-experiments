#include <Adafruit_SleepyDog.h>
#include <Wire.h>
#include <Digital_Light_TSL2561.h>
#include <Reactduino.h>
#include <WiFiNINA.h>
#include <MQTT.h>
#include <I2S.h>
#include <movingAvg.h>

#include "configuration.h"

const char ssid[] = SECRET_SSID;
const char pass[] = SECRET_PASS;

WiFiClient net;
MQTTClient client;



#ifdef MICROPHONE
  movingAvg level(128);
  #define SAMPLES 128 // make it a power of two for best DMA performance
  #define I2S_BUFFER_SIZE 512
  uint8_t buffer[I2S_BUFFER_SIZE];
  #define I2S_BITS_PER_SAMPLE 32
  int *I2Svalues = (int *) buffer;
#endif


/*
 *  SETUP
 *  -----
 */

void app_main() {
  Serial.begin(115200);
  WiFi.begin(ssid, pass);
  client.begin(HOST_NAME, net);
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
  I2S.read();
#endif

#ifdef MOTION
  app.repeat(MOTION_SAMPLING_INTERVAL, sampleMotion);
#endif

  app.onTick(loop_main);
  int countdownMS = Watchdog.enable(4000);
  publishMessage("/system/reset", String(Watchdog.resetCause()));
}

Reactduino app(app_main);

/*
 *  MAIN LOOP
 *  ---------
 */
void loop_main() {
  Watchdog.reset();
  client.loop();

  if (!client.connected()) {
    connect();
  }

#ifdef MICROPHONE;
  int reading = sample() - MICROPHONE_BASELINE;
  level.reading(reading);
//  Serial.print(reading);
//  Serial.print(" ");
//  Serial.println(level.getAvg());
#endif;
}

/*
 * LIGHT SAMPLING
 * --------------
 */

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

void sampleSound() {
  //  Serial.print("/sound: ");
  //  Serial.print(average);
  publishMessage("/sound", String(level.getAvg()));
}




int sample() {
  // read a bunch of samples:
  int samples[SAMPLES];
  int nSamples = 0;
  int maxsample = -100000;
  int minsample = 1000000;

  while (nSamples < SAMPLES) {
    I2S.read(buffer, I2S_BUFFER_SIZE);
    for (int i = 0; i < I2S_BITS_PER_SAMPLE; i++) {
      if ((I2Svalues[i]!= 0) && (I2Svalues[i] != -1)) {
        I2Svalues[i] >>= 14;
        if (nSamples < SAMPLES) {
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
     minsample = min(minsample, abs(samples[i]));
     maxsample = max(maxsample, abs(samples[i]));
  }  
//  Serial.print((maxsample - minsample) - MICROPHONE_BASELINE);
//  Serial.print(" ");
//  Serial.print(level.getAvg());
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
}
