#include <WiFi.h>
#include <WebSocketsServer.h>

// WiFi Credentials
const char* ssid = "kovz_WiFi2G";
const char* password = "74906016172229820339";

// WebSocket Server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);

void setup() {
    Serial.begin(115200);

    // Connect to WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.print("Connected! ESP32 IP Address: ");
    Serial.println(WiFi.localIP());

    // Start WebSocket Server
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);
}

void loop() {
    webSocket.loop(); // Handle WebSocket communication
}

// WebSocket Event Handler
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case WStype_CONNECTED:
            Serial.println("Client Connected!");
            break;
        case WStype_DISCONNECTED:
            Serial.println("Client Disconnected!");
            break;
        case WStype_TEXT:
            Serial.print("Received: ");
            Serial.println((char*)payload);
            break;
    }
}
