const mqtt = require('mqtt');
const mongoose = require('mongoose');

// Konfigurasi MQTT
const mqttBroker = 'mqtt://test.mosquitto.org';
const mqttTopic = 'topic/testmqtt';

// Konfigurasi MongoDB
const mongoURL = 'mongodb://127.0.0.1:27017/mqtt_mosquitto'; // Ganti dengan URL MongoDB Anda


// Koneksi MQTT
const client = mqtt.connect(mqttBroker);

// Koneksi MongoDB
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Terhubung ke MongoDB');
  })
  .catch((error) => {
    console.error('Gagal terhubung ke MongoDB:', error);
    process.exit(1);
  });

// Skema MongoDB
const messageSchema = new mongoose.Schema({
  topic: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Model MongoDB
const Message = mongoose.model('Message', messageSchema);

// Menangani pesan yang diterima
client.on('message', (topic, message) => {
  console.log(`Pesan: ${message.toString()}, Topik: ${topic}`);

  // Simpan data ke MongoDB dengan mekanisme retry
  const newMessage = new Message({
    topic: topic,
    message: message.toString(),
  });

  saveWithRetry(newMessage);
});

// Subscribe ke topik MQTT
client.on('connect', () => {
  console.log('Terhubung ke MQTT');
  client.subscribe(mqttTopic);
});

// Menangani kesalahan koneksi MQTT
client.on('error', (error) => {
  console.error('Gagal terhubung ke MQTT:', error);
  process.exit(1);
});

// Simpan data ke MongoDB dengan mekanisme retry
function saveWithRetry(newMessage, retryCount = 3, delay = 1000) {
  return newMessage.save()
    .then(() => {
      console.log('Data disimpan ke MongoDB');
    })
    .catch((error) => {
      if (retryCount <= 0) {
        console.error('Gagal menyimpan data ke MongoDB:', error);
        return;
      }

      console.warn('Error menyimpan data ke MongoDB. Melakukan retry...');
      return new Promise((resolve) => setTimeout(resolve, delay))
        .then(() => saveWithRetry(newMessage, retryCount - 1, delay * 2));
    });
}
