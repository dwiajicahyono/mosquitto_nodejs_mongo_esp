#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// Konfigurasi WiFi
const char* ssid = "Nama WiFi";
const char* password = "Isi password";

// Konfigurasi MQTT
const char* mqttServer = "test.mosquitto.org";
const int mqttPort = 1883;
const char* mqttTopic = "topic/testmqtt";
const char* mqttMessage = "hello from esp8266";

// Objek klien WiFi dan MQTT
WiFiClient espClient;
PubSubClient client(espClient);

// Konfigurasi pin GPIO
const int ledPin = LED_BUILTIN; // GPIO internal ESP8266 untuk LED

// Fungsi koneksi WiFi
void connectWiFi() {
  delay(10);
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

// Fungsi koneksi MQTT
void connectMQTT() {
  client.setServer(mqttServer, mqttPort);
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("mqtt-tester")) {
      Serial.println("Connected to MQTT");
      digitalWrite(ledPin, HIGH); // Menyalakan lampu internal ESP8266 saat terhubung ke MQTT
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying...");
      delay(1000);
    }
  }
}

// Fungsi pengiriman pesan
void publishMessage() {
  Serial.println("Sending message: " + String(mqttMessage));
  client.publish(mqttTopic, mqttMessage);
}

void setup() {
  Serial.begin(115200);

  // Mengatur pin GPIO sebagai OUTPUT
  pinMode(ledPin, OUTPUT);

  // Menghubungkan ke WiFi
  connectWiFi();

  // Menghubungkan ke MQTT broker
  connectMQTT();
}

void loop() {
  if (!client.connected()) {
    connectMQTT();
  }

  // Mengirim pesan setiap 2 detik
  publishMessage();
  delay(2000);
}
