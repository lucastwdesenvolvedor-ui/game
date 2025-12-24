import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// ================== ESTADO DO JOGO ==================
const players = {};

// ================== SOCKET ==================
io.on("connection", socket => {
  console.log("Jogador conectado:", socket.id);

  // cria jogador
  players[socket.id] = {
    x: 100,
    y: 100
  };

  // envia jogadores atuais
  socket.emit("currentPlayers", players);

  // avisa outros jogadores
  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    x: players[socket.id].x,
    y: players[socket.id].y
  });

  // movimento
  socket.on("move", data => {
    if (!players[socket.id]) return;

    players[socket.id].x = data.x;
    players[socket.id].y = data.y;

    socket.broadcast.emit("playerMoved", {
      id: socket.id,
      x: data.x,
      y: data.y
    });
  });

  // chat
  socket.on("chatMessage", data => {
    if (!data?.message) return;

    io.emit("chatMessage", {
      id: socket.id,
      message: data.message.slice(0, 100)
    });
  });

  // desconectar
  socket.on("disconnect", () => {
    console.log("Jogador saiu:", socket.id);

    delete players[socket.id];
    socket.broadcast.emit("playerDisconnected", socket.id);
  });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
