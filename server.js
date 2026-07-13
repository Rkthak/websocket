const express = require("express");
const http = require("http");
const webSocket = require("ws");
const { PORT } = require("./utils/config");

// express server
const app = express();

app.use(express.static("public"));

// http server
const server = http.createServer(app);

// webSocket server
const wss = new webSocket.Server({ server });

// connect client
wss.on("connection", (socket) => {
  console.log("new client connected");
});

server.listen(PORT, () => {
  console.log("Server running...");
});
