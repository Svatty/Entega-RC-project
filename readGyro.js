let ws;
let esp32Ip = "";

// Function to connect to ESP32 WebSocket
function connectWebSocket() {
    esp32Ip = document.getElementById("esp32Ip").value.trim();
    if (!esp32Ip) {
        alert("Please enter the ESP32 IP address!");
        return;
    }

    const wsUrl = `ws://${esp32Ip}:81/`;
    ws = new WebSocket(wsUrl);

    ws.onopen = function () {
        console.log("Connected to ESP32 WebSocket");
        document.getElementById("status").innerText = "Connected";
    };

    ws.onmessage = function (event) {
        console.log("ESP32 says:", event.data);
    };

    ws.onclose = function () {
        console.log("Disconnected from ESP32");
        document.getElementById("status").innerText = "Disconnected";
    };
}

// Function to send gyro data to ESP32
function sendGyroData(yaw, pitch, roll) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const data = { yaw, pitch, roll };
        ws.send(JSON.stringify(data));
    } else if (esp32Ip) {
        fetch(`http://${esp32Ip}/update?yaw=${yaw}&pitch=${pitch}&roll=${roll}`)
            .then(response => response.text())
            .then(data => console.log("ESP32 Response:", data))
            .catch(error => console.error("Error:", error));
    }
}

// Listen to device orientation events (gyro data)
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (event) {
        const yaw = event.alpha || 0;  // Z-axis rotation (compass direction)
        const pitch = event.beta || 0; // X-axis rotation (front/back tilt)
        const roll = event.gamma || 0; // Y-axis rotation (side tilt)

        // Display rotation data
        document.getElementById("rotationData").innerHTML = 
            `Yaw: ${yaw.toFixed(2)}° <br> Pitch: ${pitch.toFixed(2)}° <br> Roll: ${roll.toFixed(2)}°`;

        // Send data to ESP32
        sendGyroData(yaw, pitch, roll);
    });
} else {
    alert("Device orientation is not supported on this device.");
}
