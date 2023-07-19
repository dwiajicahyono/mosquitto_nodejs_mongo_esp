// const mqtt = require('mqtt');
// const client = mqtt.connect('mqtt://test.mosquitto.org'); 
// const topic = 'topic/testmqtt';
// const message = 'test message'; 

// client.on('connect', () => {
//     console.log(`Is client connected: ${client.connected}`);    
//     if (client.connected === true) {
//         console.log(`message: ${message}, topic: ${topic}`); 
//         // publish message        
//         client.publish(topic, message);
//     }

//     // subscribe to a topic
//     client.subscribe(topic);
// });

// // receive a message from the subscribed topic
// client.on('message',(topic, message) => {
//     console.log(`message: ${message}, topic: ${topic}`); 
// });

// // error handling
// client.on('error',(error) => {
//     console.error(error);
//     process.exit(1);
// });
const mqtt = require('mqtt');
const mongoose = require('mongoose');

// MQTT Configuration
const mqttBroker = 'mqtt://test.mosquitto.org';
const mqttTopic = 'topic/testmqtt';

// MongoDB Configuration
const mongoURL = 'mongodb://127.0.0.1:27017/mqtt_mosquitto'; // Replace with your MongoDB URL
// const mongoDB = 'mqtt_mosquitto'; // Replace with your MongoDB database name
// const mongoCollection = 'mqttdwi'; // Replace with your MongoDB collection name

// MQTT Connection
const client = mqtt.connect(mqttBroker);

// MongoDB Connection
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });

// MongoDB Schema
const messageSchema = new mongoose.Schema({
  topic: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// MongoDB Model
const Message = mongoose.model('Message', messageSchema);

// Handle received messages
client.on('message', (topic, message) => {
  console.log(`Message: ${message.toString()}, Topic: ${topic}`);

  // Save data to MongoDB with retry mechanism
  const newMessage = new Message({
    topic: topic,
    message: message.toString(),
  });

  saveWithRetry(newMessage);
});

// Subscribe to MQTT topic
client.on('connect', () => {
  console.log('Connected to MQTT');
  client.subscribe(mqttTopic);
});

// Handle MQTT connection errors
client.on('error', (error) => {
  console.error('Failed to connect to MQTT:', error);
  process.exit(1);
});

// Save data to MongoDB with retry mechanism
function saveWithRetry(newMessage, retryCount = 3, delay = 1000) {
  return newMessage.save()
    .then(() => {
      console.log('Data saved to MongoDB');
    })
    .catch((error) => {
      if (retryCount <= 0) {
        console.error('Failed to save data to MongoDB:', error);
        return;
      }

      console.warn('Error saving data to MongoDB. Retrying...');
      return new Promise((resolve) => setTimeout(resolve, delay))
        .then(() => saveWithRetry(newMessage, retryCount - 1, delay * 2));
    });
}
