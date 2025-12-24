// conexão com o servidor (Render / produção)
const socket = io();

// ================== CHAT ==================
const chat = document.getElementById("chat");
const chatToggle = document.getElementById("chatToggle");
const input = document.getElementById("chatInput");
const messages = document.getElementById("messages");

if (chatToggle) {
  chatToggle.addEventListener("click", () => {
    chat.classList.toggle("hidden");
  });
}

// ================== PLAYER LOCAL ==================
const myPlayer = {
  x: 100,
  y: 100,
  el: document.getElementById("player")
};

if (myPlayer.el) {
  myPlayer.el.style.left = myPlayer.x + "px";
  myPlayer.el.style.top = myPlayer.y + "px";
}

// ================== OUTROS JOGADORES ==================
const otherPlayers = {};

// recebe jogadores atuais
socket.on("currentPlayers", players => {
  for (let id in players) {
    if (id === socket.id) {
      myPlayer.x = players[id].x;
      myPlayer.y = players[id].y;

      if (myPlayer.el) {
        myPlayer.el.style.left = myPlayer.x + "px";
        myPlayer.el.style.top = myPlayer.y + "px";
      }
    } else {
      createOtherPlayer(id, players[id]);
    }
  }
});

// novo jogador
socket.on("newPlayer", data => {
  createOtherPlayer(data.id, data);
});

// jogador se moveu
socket.on("playerMoved", data => {
  const p = otherPlayers[data.id];
  if (!p) return;

  p.x = data.x;
  p.y = data.y;

  p.el.style.left = p.x + "px";
  p.el.style.top = p.y + "px";
});

// jogador saiu
socket.on("playerDisconnected", id => {
  if (otherPlayers[id]) {
    otherPlayers[id].el.remove();
    delete otherPlayers[id];
  }
});

// cria jogador remoto
function createOtherPlayer(id, data) {
  const el = document.createElement("div");
  el.className = "player";
  el.style.left = data.x + "px";
  el.style.top = data.y + "px";

  document.body.appendChild(el);

  otherPlayers[id] = {
    el,
    x: data.x,
    y: data.y
  };
}

// ================== MOVIMENTO (TECLADO) ==================
document.addEventListener("keydown", e => {
  if (chat && !chat.classList.contains("hidden")) return;

  if (e.key === "w") move(0, -5);
  if (e.key === "s") move(0, 5);
  if (e.key === "a") move(-5, 0);
  if (e.key === "d") move(5, 0);
});

// move player local
function move(dx, dy) {
  myPlayer.x += dx;
  myPlayer.y += dy;

  if (myPlayer.el) {
    myPlayer.el.style.left = myPlayer.x + "px";
    myPlayer.el.style.top = myPlayer.y + "px";
  }

  socket.emit("move", {
    x: myPlayer.x,
    y: myPlayer.y
  });
}

// ================== MOVIMENTO (BOTÕES / MOBILE) ==================
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
  if (!btn) return;

  btn.addEventListener("touchstart", e => {
    e.preventDefault();
    startMove(dx, dy);
  });

  btn.addEventListener("touchend", stopMove);
  btn.addEventListener("mousedown", () => startMove(dx, dy));
  btn.addEventListener("mouseup", stopMove);
  btn.addEventListener("mouseleave", stopMove);
}

const up = document.getElementById("up");
const down = document.getElementById("down");
const left = document.getElementById("left");
const right = document.getElementById("right");

bindButton(up, 0, -5);
bindButton(down, 0, 5);
bindButton(left, -5, 0);
bindButton(right, 5, 0);

// ================== CHAT (ENVIO / RECEBIMENTO) ==================
if (input) {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
}

const sendBtn = document.getElementById("send");
if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

function sendMessage() {
  if (!input || !input.value.trim()) return;
  if (input.value.length > 100) return;

  socket.emit("chatMessage", {
    message: input.value
  });

  input.value = "";
}

socket.on("chatMessage", data => {
  if (!messages) return;

  const msg = document.createElement("div");
  msg.textContent = data.id.slice(0, 4) + ": " + data.message;

  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
});
