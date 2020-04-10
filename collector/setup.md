# Setup

## Requirements
- Raspberry Pi (+ SD card) with Raspbian installed
- USB drive (formatted in exFAT, named 'collector##')

## a. Configuration
1. Flash the SD card with the latest version of Raspbian (through for instance Etcher)
2. Setup the Raspberry Pi (language/timezone/password/update etc.)
3. Change hostname (in RPi Configuration > System) to 'collector##'
4. Enable SSH mode (in RPi Configuration > Interfaces)
5. Update Nodejs
```
$ sudo su
$ curl -sL https://deb.nodesource.com/setup_13x | bash -
$ apt-get install -y nodejs
```
6. Install exFAT utils
```
$ sudo apt-get install exfat-fuse exfat-utils
```
7. Insert the USB stick (formatted in exFAT, named the same as in step 3: 'collector##')

## b. MQTT server
8. Install Mosquitto
```
$ sudo apt install -y mosquitto mosquitto-clients
$ sudo systemctl enable mosquitto.service
```
9. Configure the mosquitto broker by adding the following to `/etc/mosquitto/conf.d/mosquitto.conf`
```
password_file /etc/mosquitto/passwd
allow_anonymous false
```
10. Add the password file
`$ sudo mosquitto_passwd -c /etc/mosquitto/passwd <user_name>`
11. Restart the mosquitto broker
`$ sudo systemctl restart mosquitto`

## c. Collector script
12. Clone the repository
```
$ git clone https:github.com/thvanarkel/data-informed-design-experiments
```
13. Change to the collector directory, install and add the `.env` file
```
$ npm install
$ touch .env
$ nano .env
```
and add the following:
```
USERN={broker-username}
PASSWORD={broker-password}
HOST={InfluxDB-host-url}
TOKEN={InfluxDB-token}
ORG={InfluxDB-organisation}
BUCKET={InfluxDB-bucket-name}
```
14. Create sensor-data directory
```
$ cd Documents
$ mkdir sensor-data
```
15. Install pm2 and run the collector script on startup
```
$ npm install -g pm2
$ pm2 start /home/pi/Documents/data-informed-design-experiments/collector/collector.js
$ pm2 startup
$ pm2 save
```
