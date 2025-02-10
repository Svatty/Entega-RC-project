let ws;
let laptopIp = ""; // This will be set dynamically
const wsPort = 443;  // Ensure the server is listening on this port
const reconnectInterval = 5000; // Attempt reconnect every 5 seconds
let lastYaw = 0, lastPitch = 0, lastRoll = 0; // Track last sent values

// Function to update the laptop IP dynamically
function updateLaptopIp() {
    const newIp = document.getElementById("laptopIP").value.trim();
    if (newIp) {
        laptopIp = newIp;
        console.log("🔄 Updated Laptop IP to:", laptopIp);
        connectWebSocket();  // Reconnect with the new IP
    } else {
        console.error("⚠ No IP entered! Please enter the server IP.");
        alert("Please enter a valid server IP before connecting.");
    }
}

// Function to connect to the laptop WebSocket server
function connectWebSocket() {
    if (!laptopIp) {
        console.warn("⚠ No IP set. Enter the Laptop IP first!");
        return;
    }

    // Dynamically generate wsUrl AFTER laptopIp is set
    const wsUrl = `wss://${laptopIp}:${wsPort}/esp32`;
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

// Auto-connect on page load (but only if an IP is set)
document.addEventListener("DOMContentLoaded", function () {
    requestGyroPermission();
});
