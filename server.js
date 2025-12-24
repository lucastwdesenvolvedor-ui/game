import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});

app.use(express.static("public"));

const players = {};

io.on("connection", socket => {

  players[socket.id] = { x: 100, y: 100 };

  socket.emit("currentPlayers", players);

  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    x: 100,
    y: 100
  });

  socket.on("move", data => {
    players[socket.id] = data;
    socket.broadcast.emit("playerMoved", {
      id: socket.id,
      x: data.x,
      y: data.y
    });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    socket.broadcast.emit("playerDisconnected", socket.id);
  });

});

