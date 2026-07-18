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
const rooms = {};
wss.on("connection", (socket) => {
  //  broadcast
  socket.on("message", (message) => {
    const data = JSON.parse(message.toString());
    if (data.type === "join") {
      socket.name = data.user;
      socket.room = data.room;

      if (!rooms[data.room]) {
        rooms[data.room] = [];
      }

      rooms[data.room].push(socket);

      console.log(rooms);

      rooms[socket.room].forEach((client) => {
        if (client !== socket) {
          const joinData = {
            type: "join",
            user: socket.name,
          };

          client.send(JSON.stringify(joinData));
        }
      });
    } else if (data.type === "message") {
      const messageData = {
        type: "message",
        user: socket.name,
        text: data.text,
      };

      rooms[socket.room].forEach((client) => {
        client.send(JSON.stringify(messageData));
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("Server running...");
});
