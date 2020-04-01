# Setup

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

## b. MQTT server
6. Install Mosquitto
```
$ sudo apt install -y mosquitto mosquitto-clients
$ sudo systemctl enable mosquitto.service
```
7. Configure the mosquitto broker by adding the following to `/etc/mosquitto/conf.d/mosquitto.conf`
```
password_file /etc/mosquitto/passwd
allow_anonymous false
```
8. Add the password file
`$ sudo mosquitto_passwd -c /etc/mosquitto/passwd <user_name>`
9. Restart the mosquitto broker
`$ sudo systemctl restart mosquitto`

## c. Collector script
10. Clone the repository
```
$ git clone https:github.com/thvanarkel/data-informed-design-experiments
```
11. Change to the collector directory, install and add the `.env` file
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
12. Create sensor-data directory
```
$ cd Documents
$ mkdir sensor-data
```
13. Install pm2 and run the collector script on startup
```
$ npm install -g pm2
$ pm2 start /home/pi/Documents/data-informed-design-experiments/collector/collector.js
$ pm2 startup
$ pm2 save
```
