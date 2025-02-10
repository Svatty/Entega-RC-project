let ws;
let laptopIp = "172.30.161.97"; // Change this to your laptop's local IP
const wsPort = 443;  // Ensure the server is listening on this port
const wsUrl = `wss://${laptopIp}:${wsPort}/esp32`;  // Secure WebSocket with /esp32 path for ESP32
const reconnectInterval = 5000; // Attempt reconnect every 5 seconds
let lastYaw = 0, lastPitch = 0, lastRoll = 0; // Track last sent values

// Function to connect to the laptop WebSocket server
function connectWebSocket() {
    console.log("Connecting to:", wsUrl);
    
    ws = new WebSocket(wsUrl);

    ws.onopen = function () {
        console.log("✅ Connected to Laptop WebSocket Relay");
        document.getElementById("status").innerText = "Connected to Laptop Relay";
    };

    ws.onmessage = function (event) {
        console.log("💻 Laptop Relay Response:", event.data);
        document.getElementById("status").innerText = `Server Message: ${event.data}`;
    };

    ws.onclose = function () {
        console.warn("❌ Disconnected from Laptop Relay. Retrying in 5s...");
        document.getElementById("status").innerText = "Disconnected. Reconnecting...";
        setTimeout(connectWebSocket, reconnectInterval);
    };

    ws.onerror = function (error) {
        console.error("⚠ WebSocket Error:", error);
    };
}

// Function to send gyro data efficiently
function sendGyroData(yaw, pitch, roll) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        if (Math.abs(yaw - lastYaw) > 1 || Math.abs(pitch - lastPitch) > 1 || Math.abs(roll - lastRoll) > 1) {
            const data = { yaw, pitch, roll };
            ws.send(JSON.stringify(data));  // Send JSON data to the WebSocket server
            lastYaw = yaw;
            lastPitch = pitch;
            lastRoll = roll;
        }
    } else {
        console.warn("⚠ WebSocket not connected!");
    }
}

// Function to handle device motion permissions
function requestGyroPermission() {
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission()
            .then((response) => {
                if (response === "granted") {
                    window.addEventListener("deviceorientation", handleGyroData);
                } else {
                    alert("Gyro access denied. Enable motion & orientation access in settings.");
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener("deviceorientation", handleGyroData);
    }
}

// Function to process gyro data
function handleGyroData(event) {
    const yaw = event.alpha || 0;  // Z-axis rotation (compass direction)
    const pitch = event.beta || 0; // X-axis rotation (front/back tilt)
    const roll = event.gamma || 0; // Y-axis rotation (side tilt)

    // Display rotation data
    document.getElementById("rotationData").innerHTML = 
        `Yaw: ${yaw.toFixed(2)}° <br> Pitch: ${pitch.toFixed(2)}° <br> Roll: ${roll.toFixed(2)}°`;

    // Send data to Laptop Relay
    sendGyroData(yaw, pitch, roll);
}

// Function to update the laptop IP dynamically
function updateLaptopIp() {
    const newIp = document.getElementById("laptopIp").value.trim();
    if (newIp) {
        laptopIp = newIp;
        console.log("🔄 Updated Laptop IP to:", laptopIp);
        connectWebSocket();
    }
}

// Auto-connect on page load
document.addEventListener("DOMContentLoaded", function () {
    connectWebSocket();
    requestGyroPermission();
});
