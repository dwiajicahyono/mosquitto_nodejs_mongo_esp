const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org'); 

client.on('connect', () => {
    console.log(`Apakah klien terhubung: ${client.connected}`);
});

client.on('error', (error) => {
    console.error(error);
    process.exit(1);
});

