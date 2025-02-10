let ws;
let laptopIp = "172.30.161.97"; // Change this to your laptop's local IP

// Function to connect to the laptop WebSocket server
function connectWebSocket() {
    const wsUrl = `wss://${laptopIp}:443`;  // Connect to your laptop relay server
    ws = new WebSocket(wsUrl);

    ws.onopen = function () {
        console.log("Connected to Laptop WebSocket Relay");
        document.getElementById("status").innerText = "Connected to Laptop Relay";
    };

    ws.onmessage = function (event) {
        console.log("Laptop Relay Response:", event.data);
    };

    ws.onclose = function () {
        console.log("Disconnected from Laptop Relay");
        document.getElementById("status").innerText = "Disconnected";
    };
}

// Function to send gyro data to the laptop WebSocket relay
function sendGyroData(yaw, pitch, roll) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const data = { yaw, pitch, roll };
        ws.send(JSON.stringify(data));
    } else {
        console.error("WebSocket not connected!");
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

        // Send data to Laptop Relay
        sendGyroData(yaw, pitch, roll);
    });
} else {
    alert("Device orientation is not supported on this device.");
}

// Call connectWebSocket when the page loads
connectWebSocket();
