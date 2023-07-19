const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org'); 
const topic = 'topic/testmqtt';
const message = 'pesan uji dwi'; 

// client.on('connect', () => {
//     console.log(`Apakah klien terhubung: ${client.connected}`);
// });

// client.on('error', (error) => {
//     console.error(error);
//     process.exit(1);
// });

function publishMessage() {
    console.log(`Mengirim pesan: ${message}, ke topik: ${topic}`); 
    // Mengirim pesan
    client.publish(topic, message);
}

// Mengirim pesan setiap 3 detik
// publishMessage()
  setInterval(publishMessage, 3000);
