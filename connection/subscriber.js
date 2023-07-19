const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org'); 
const topic = 'topic/testmqtt';

client.on('connect', () => {
    console.log(`Apakah klien terhubung: ${client.connected}`);    
    if (client.connected === true) {
        console.log(`Melakukan langganan ke topik: ${topic}`); 
        // Melakukan langganan (subscribe) ke topik
        client.subscribe(topic);
    }
});

client.on('message', (topic, message) => {
    console.log(`Pesan: ${message.toString()}, topik: ${topic}`); 
});

client.on('error', (error) => {
    console.error(error);
    process.exit(1);
});
