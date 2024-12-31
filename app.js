const express = require("express");
const server = require("http").createServer();
const path = require("path");

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Serve the index.html file for the root route
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "public") });
});

const PORT = 3000;
server.on("request", app);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
