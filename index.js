require("dotenv").config();
const express = require("express");
const app = express();
const socketio = require("socket.io");
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);

const io = new socketio.Server(server);

const connectedUsers = {};
io.on("connection", (socket) => {
  const { user_id } = socket.handshake.query;
  connectedUsers[user_id] = socket.id;

  socket.on("newRoom", (room_id) => {
    socket.join(`room${room_id}`);
    socket.to(`room${room_id}`).emit("joinRoom");
  });

  socket.on("leaveRoom", (room_id) => {
    socket.leave(`room${room_id}`);
  });

  socket.on("newMsg", (data) => {
    socket.to(`room${data.room_id}`).emit("newMsg", data);
  });

  socket.on("disconnect", async () => {
    delete connectedUsers[user_id];
  });
});

app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  return next();
});
app.use(cors());
app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

server.listen(process.env.PORT || 3333, () => {
  console.log("listening on *:" + process.env.PORT);
});
