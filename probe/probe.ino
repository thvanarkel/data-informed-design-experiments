#include <Adafruit_SleepyDog.h>
#include <Wire.h>
#include <Reactduino.h>
#include <WiFiNINA.h>
#include <MQTT.h>


#include "configuration.h"

const char ssid[] = SECRET_SSID;
const char pass[] = SECRET_PASS;

WiFiClient net;
MQTTClient client;

#ifdef MICROPHONE
#include <I2S.h>
#include <movingAvg.h>
movingAvg level(128);
#define SAMPLES 128 // make it a power of two for best DMA performance
#define I2S_BUFFER_SIZE 512
uint8_t buffer[I2S_BUFFER_SIZE];
#define I2S_BITS_PER_SAMPLE 32
int *I2Svalues = (int *) buffer;
#endif

#ifdef DIGITAL_LIGHT
#include <Digital_Light_TSL2561.h>
#endif

#ifdef TIME_OF_FLIGHT
#include "Seeed_vl53l0x.h"
Seeed_vl53l0x VL53L0X;
#endif

#if defined(ACCELEROMETER) || defined(GYROSCOPE)
#include <Arduino_LSM6DS3.h>
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

#ifdef ANALOG_LIGHT
  app.repeat(LIGHT_SAMPLING_INTERVAL, sampleAnalogLight);
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

#ifdef TIME_OF_FLIGHT
  VL53L0X_Error Status = VL53L0X_ERROR_NONE;
  Status = VL53L0X.VL53L0X_common_init();
  if (VL53L0X_ERROR_NONE != Status) {
    Serial.println("start vl53l0x mesurement failed!");
    VL53L0X.print_pal_error(Status);
    while (1);
  }
  VL53L0X.VL53L0X_single_ranging_init();
  if (VL53L0X_ERROR_NONE != Status) {
    Serial.println("start vl53l0x mesurement failed!");
    VL53L0X.print_pal_error(Status);
    while (1);
  }
  app.repeat(ToF_SAMPLING_INTERVAL, sampleToF);
#endif

#if defined(ACCELEROMETER) || defined(GYROSCOPE)
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }
#endif
#ifdef ACCELEROMETER
  app.repeat(ACCELEROMETER_SAMPLING_INTERVAL, sampleAcceleration);
#endif
#ifdef GYROSCOPE
  app.repeat(GYROSCOPE_SAMPLING_INTERVAL, sampleGyro);
#endif

  app.onTick(loop_main);
  int countdownMS = Watchdog.enable(4000);
  /*  Publish the cause of the last reset
   *  1: Power On Reset
   *  2: Brown Out 12 Detector Reset
   *  4: Brown Out 33 Detector Reset
   *  16:External Reset
   *  32:Watchdog Reset
   *  64:System Reset Request
   */
  publishMessage("/system/reset", String("{\"fields\":{\"value\":\"" + String(Watchdog.resetCause()) + "\"}}"));
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
#ifdef DEBUG_AUDIO;
  Serial.print(reading);
  Serial.print(" ");
  Serial.println(level.getAvg());
#endif;
#endif;
}

/*
 * DIGITAL LIGHT SAMPLING
 * ----------------------
 */

#ifdef DIGITAL_LIGHT
int oldLightLevel = 0;

void sampleLight() {
  int lightLevel = TSL2561.readVisibleLux();
#ifdef DEBUG_MESSAGE
  Serial.print("/light: ");
  Serial.println(lightLevel);
#endif
  publishMessage("/light", String("{\"fields\":{\"value\":\"" + String(lightLevel) + "\"}}"));
  oldLightLevel = lightLevel;
}
#endif

/*
 * ANALOG LIGHT SAMPLING
 * ---------------------
 */

#ifdef ANALOG_LIGHT
int oldAnalogLightLevel = 0;

void sampleAnalogLight() {
  analogRead(LIGHT_PIN);
  int lightLevel = analogRead(LIGHT_PIN);
#ifdef DEBUG_MESSAGE
  Serial.print("/light-a: ");
  Serial.println(lightLevel);
#endif
  publishMessage("/light-a", String("{\"fields\":{\"value\":\"" + String(lightLevel) + "\"}}"));
  oldAnalogLightLevel = lightLevel;
}
#endif

/*
 * MICROPHONE SAMPLING
 * -------------------
 */

#ifdef MICROPHONE

void sampleSound() {
  int l = level.getAvg();
  l = constrain(l, 0, 32767);
#ifdef DEBUG_MESSAGE
  Serial.print("/sound: ");
  Serial.println(l);
#endif

  publishMessage("/sound", String("{\"fields\":{\"value\":\"" + String(l) + "\"}}"));
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
      if ((I2Svalues[i] != 0) && (I2Svalues[i] != -1)) {
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
  return (maxsample - minsample);
}
#endif

/*
 * MOTION SAMPLING
 * ---------------
 */

#ifdef MOTION

void sampleMotion() {
  int val = digitalRead(MOTION_PIN);
#ifdef DEBUG_MESSAGE
  Serial.print("/motion: ");
  Serial.println(val);
#endif
  publishMessage("/motion", String("{\"fields\":{\"value\":\"" + String(val) + "\"}}"));
}

#endif

/*
 * TIME_OF_FLIGHT SAMPLING
 * -----------------------
 */

#ifdef TIME_OF_FLIGHT
void sampleToF() {
  VL53L0X_RangingMeasurementData_t RangingMeasurementData;
  VL53L0X_Error Status = VL53L0X_ERROR_NONE;

  memset(&RangingMeasurementData, 0, sizeof(VL53L0X_RangingMeasurementData_t));
  Status = VL53L0X.PerformSingleRangingMeasurement(&RangingMeasurementData);
  if (VL53L0X_ERROR_NONE == Status) {
    if (RangingMeasurementData.RangeMilliMeter >= 2000) {
      Serial.println("out of range!!");
    } else {
      #ifdef DEBUG_MESSAGE
        Serial.print("/distance: ");
        Serial.println(RangingMeasurementData.RangeMilliMeter);
      #endif
      publishMessage("/distance", String("{\"fields\":{\"value\":\"" + String(RangingMeasurementData.RangeMilliMeter) + "\"}}"));
    }
  }
}

#endif

/*
 * ACCELERATION SAMPLING
 * ---------------------
 */

#ifdef ACCELEROMETER

void sampleAcceleration() {
  float x, y, z;
  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(x, y, z);
  #ifdef DEBUG_MESSAGE
    Serial.print("/acceleration: ");
    Serial.println(String(x) + ", " + String(y) + ", " + String(z));
  #endif
    publishMessage("/acceleration", String("{\"fields\":{\"x\":\"" + String(x) + "\", \"y\":\"" + String(y) + "\", \"z\":\"" + String(z) + "\"}}"));
  }
}

#endif

/*
 * GYRO SAMPLING
 * ---------------------
 */

#ifdef GYROSCOPE

void sampleGyro() {
  float x, y, z;
  if (IMU.gyroscopeAvailable()) {
    IMU.readGyroscope(x, y, z);
  #ifdef DEBUG_MESSAGE
    Serial.print("/orientation: ");
    Serial.println(String(x) + ", " + String(y) + ", " + String(z));
  #endif
    publishMessage("/orientation", String("{\"fields\":{\"x\":\"" + String(x) + "\", \"y\":\"" + String(y) + "\", \"z\":\"" + String(z) + "\"}}"));
  }
}

#endif

/*
 * CONNECTIVITY HANDLING
 * ---------------------
 */

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
