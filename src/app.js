const express = require("express");
const server = require("http").createServer();
const path = require("path");

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "../public")));

// Serve the index.html file for the root route
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../public") });
});

const PORT = 3000;
server.on("request", app);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Begin WebSocket setup
const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ server });

// Add the `broadcast` method to the WebSocket server instance
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
};

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected:", numClients);

  // Broadcast to all clients the current number of visitors
  wss.broadcast(`Current visitors: ${numClients}`);

  // Send a welcome message to the connected client
  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server");
  }

  // Handle client disconnection
  ws.on("close", function close() {
    const updatedNumClients = wss.clients.size; // Update the number of connected clients
    wss.broadcast(`Current visitors: ${updatedNumClients}`);
    console.log("A client has disconnected");
  });
});
