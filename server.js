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
const users = {};
wss.on("connection", (socket) => {
  //  broadcast
  socket.on("message", (message) => {
    const data = JSON.parse(message.toString());
    if (data.type === "join") {
      socket.name = data.user;
      socket.room = data.room;

      // private chat
      users[socket.name] = socket;

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
    } else if (data.type === "private") {
      const receiver = users[data.to];

      if (receiver) {
        const privateData = {
          type: "private",
          from: socket.name,
          text: data.text,
        };

        receiver.send(JSON.stringify(privateData));

        if (receiver !== socket) {
          socket.send(JSON.stringify(privateData));
        }
      } else {
        const errorData = {
          type: "error",
          message: `${data.to} is offline`,
        };

        socket.send(JSON.stringify(errorData));
      }
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

    delete users[socket.name];
  });
});

server.listen(PORT, () => {
  console.log("Server running...");
});
