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

  socket.on("close", () => {
    if (!socket.room) {
      return;
    }

    // 1. User ko room se remove karo
    rooms[socket.room] = rooms[socket.room].filter((client) => {
      return client !== socket;
    });

    // 2. Room empty hai?
    if (rooms[socket.room].length > 0) {
      const leaveData = {
        type: "leave",
        user: socket.name,
      };

      rooms[socket.room].forEach((client) => {
        client.send(JSON.stringify(leaveData));
      });
    } else {
      delete rooms[socket.room];
    }
  });
});

server.listen(PORT, () => {
  console.log("Server running...");
});
