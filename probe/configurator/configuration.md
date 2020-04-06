Change the respective values in here and change filename from `configuration.md` to `configuration.h`

```
// CONFIGURATION

// INTERNET CONNECTION
#define SECRET_SSID "####"
#define SECRET_PASS "####"

// MQTT CONFIGURATION
#define SECRET_USERNAME "####"
#define SECRET_PASSWORD "####"

// THING CONFIGURATION
#define THING_NAME "thing"

#define DIGITAL_LIGHT
  #define LIGHT_SAMPLING_INTERVAL 8000
#define MICROPHONE
  #define MICROPHONE_BASELINE 7200
  #define SOUND_SAMPLING_INTERVAL 1000
#define MOTION
  #define MOTION_PIN 5
  #define MOTION_SAMPLING_INTERVAL 2000
```
