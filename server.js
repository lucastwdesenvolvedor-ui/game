import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// ✅ io PRECISA VIR ANTES DE USAR
const io = new Server(server);

app.use(express.static("public"));

const players = {};

io.on("connection", socket => {
  console.log("Jogador conectado:", socket.id);

  // jogador entra
  players[socket.id] = { x: 100, y: 100 };

  socket.emit("currentPlayers", players);

  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    x: 100,
    y: 100
  });

  // movimento
  socket.on("move", data => {
    players[socket.id] = data;

    socket.broadcast.emit("playerMoved", {
      id: socket.id,
      x: data.x,
      y: data.y
    });
  });

  // 💬 CHAT (AGORA NO LUGAR CERTO)
  socket.on("chatMessage", data => {
    io.emit("chatMessage", {
      id: socket.id,
      message: data.message
    });
  });

  // desconectar
  socket.on("disconnect", () => {
    console.log("Jogador saiu:", socket.id);

    delete players[socket.id];
    socket.broadcast.emit("playerDisconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
