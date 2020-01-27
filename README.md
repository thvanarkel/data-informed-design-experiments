# data-informed-design


In order to get I2S running on the Arduino Nano 33 IoT add the following to `~/Library/Arduino15/packages/arduino/hardware/samd/1.8.3/variants/nano_33_iot/variant.h`

```
// I2S Interfaces
// --------------
#define I2S_INTERFACES_COUNT 1

#define I2S_DEVICE          0
#define I2S_CLOCK_GENERATOR 3

#define PIN_I2S_SD (4u) 
#define PIN_I2S_SCK (PIN_A3) 
#define PIN_I2S_FS (PIN_A2)
```
Based on [ArduinoCore-samd#471](https://github.com/arduino/ArduinoCore-samd/pull/471)
