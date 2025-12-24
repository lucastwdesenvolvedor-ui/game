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

  // ✅ CHAT (AGORA CORRETO)
  socket.on("chatMessage", data => {
    io.emit("chatMessage", {
      id: socket.id,
      message: data.message
    });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    socket.broadcast.emit("playerDisconnected", socket.id);
  });

});


