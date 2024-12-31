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

process.on("SIGINT", () => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === client.OPEN) {
      client.close();
    }
  });
  server.close(() => {
    shutdownDB();
  });
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

  db.run(
    `INSERT INTO visitors (count, time) VALUES (${numClients}, datetime('now'))`,
    (err) => {
      if (err) {
        console.error("Failed to insert into database:", err.message);
      }
    }
  );

  // Handle client disconnection
  ws.on("close", function close() {
    const updatedNumClients = wss.clients.size; // Update the number of connected clients
    wss.broadcast(`Current visitors: ${updatedNumClients}`);
    console.log("A client has disconnected");
  });
});

// End Web Sockets

// Begin Database
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT

    )
    `);
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    if (err) {
      console.error("Error retrieving row:", err.message);
    } else {
      console.log("Visitor record:", row);
    }
  });
}

let isDBClosed = false;

function shutdownDB() {
  if (isDBClosed) return;
  getCounts();
  console.log("Shutting Down DB");
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database closed successfully.");
      isDBClosed = true; // Mark as closed
    }
  });
}
