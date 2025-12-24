// 🔌 CONEXÃO SOCKET.IO
const socket = io();

// ================= PLAYER LOCAL =================
const myPlayer = {
  x: 100,
  y: 100,
  el: document.getElementById("player")
};

myPlayer.el.style.left = myPlayer.x + "px";
myPlayer.el.style.top = myPlayer.y + "px";

// ================= OUTROS PLAYERS =================
const otherPlayers = {};

// players iniciais
socket.on("currentPlayers", players => {
  for (let id in players) {
    if (id === socket.id) {
      myPlayer.x = players[id].x;
      myPlayer.y = players[id].y;
      updateMyPlayer();
    } else {
      createOtherPlayer(id, players[id]);
    }
  }
});

// novo player
socket.on("newPlayer", data => {
  createOtherPlayer(data.id, data);
});

// movimento dos outros
socket.on("playerMoved", data => {
  const p = otherPlayers[data.id];
  if (!p) return;

  p.x = data.x;
  p.y = data.y;
  p.el.style.left = p.x + "px";
  p.el.style.top = p.y + "px";
});

// desconectou
socket.on("playerDisconnected", id => {
  if (otherPlayers[id]) {
    otherPlayers[id].el.remove();
    delete otherPlayers[id];
  }
});

// ================= FUNÇÕES =================
function createOtherPlayer(id, data) {
  const el = document.createElement("div");
  el.className = "player";
  el.style.left = data.x + "px";
  el.style.top = data.y + "px";
  document.body.appendChild(el);

  otherPlayers[id] = { el, x: data.x, y: data.y };
}

function updateMyPlayer() {
  myPlayer.el.style.left = myPlayer.x + "px";
  myPlayer.el.style.top = myPlayer.y + "px";
}

function move(dx, dy) {
  myPlayer.x += dx;
  myPlayer.y += dy;
  updateMyPlayer();

  socket.emit("move", {
    x: myPlayer.x,
    y: myPlayer.y
  });
}

// ================= TECLADO =================
document.addEventListener("keydown", e => {
  if (!chat.classList.contains("hidden")) return;

  if (e.key === "w") move(0, -5);
  if (e.key === "s") move(0, 5);
  if (e.key === "a") move(-5, 0);
  if (e.key === "d") move(5, 0);
});

// ================= BOTÕES MOBILE =================
let moveInterval = null;

function startMove(dx, dy) {
  if (moveInterval) return;
  moveInterval = setInterval(() => move(dx, dy), 50);
}

function stopMove() {
  clearInterval(moveInterval);
  moveInterval = null;
}

function bindButton(btn, dx, dy) {
  btn.addEventListener("touchstart", e => {
    e.preventDefault();
    startMove(dx, dy);
  });
  btn.addEventListener("touchend", stopMove);

  btn.addEventListener("mousedown", () => startMove(dx, dy));
  btn.addEventListener("mouseup", stopMove);
  btn.addEventListener("mouseleave", stopMove);
}

bindButton(up, 0, -5);
bindButton(down, 0, 5);
bindButton(left, -5, 0);
bindButton(right, 5, 0);

// ================= CHAT =================
const chat = document.getElementById("chat");
const chatToggle = document.getElementById("chatToggle");
const input = document.getElementById("chatInput");
const messages = document.getElementById("messages");
const sendBtn = document.getElementById("send");

// abrir / fechar chat
chatToggle.addEventListener("click", () => {
  chat.classList.toggle("hidden");
  input.focus();
});

// enviar mensagem
function sendMessage() {
  const text = input.value.trim();
  if (!text || text.length > 100) return;

  socket.emit("chatMessage", { message: text });
  input.value = "";
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

// receber mensagem
socket.on("chatMessage", data => {
  const msg = document.createElement("div");
  msg.textContent = data.id.slice(0, 4) + ": " + data.message;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
});
