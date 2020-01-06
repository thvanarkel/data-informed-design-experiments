#include <Wire.h>
#include <Digital_Light_ISL29035.h>
#include <Digital_Light_TSL2561.h>

// CONFIGURATION
#define DIGITAL_LIGHT
#define SOUND
  #define SOUND_PIN A0


void setup()
{
  Wire.begin();
  Serial.begin(9600);
  TSL2561.init();
}

void loop()
{
  #ifdef DIGITAL_LIGHT
  Serial.print("The Light value is: ");
  Serial.println(TSL2561.readVisibleLux());
  #endif

  #ifdef SOUND
  int sensorValue = analogRead(SOUND_PIN);
  Serial.println(sensorValue);
  #endif
  
  delay(1000);
}
