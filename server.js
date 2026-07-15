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
    const data = JSON.parse(message.toString());
    if (data.type === "join") {
      socket.name = data.user;

      wss.clients.forEach((client) => {
        if (client !== socket) {
          client.send(`${socket.name} joined the room`);
        }
      });
    } else if (data.type === "message") {
      wss.clients.forEach((client) => {
        client.send(`${socket.name} : ${data.text}`);
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("Server running...");
});
