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
  //  broadcast
  socket.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client !== socket) {
        client.send(message.toString());
      }
    });
  });
});

server.listen(PORT, () => {
  console.log("Server running...");
});
