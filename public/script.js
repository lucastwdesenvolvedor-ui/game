const socket = io(window.location.origin);

const myPlayer = {
  x: 100,
  y: 100,
  el: document.getElementById("player")
};

myPlayer.el.style.left = myPlayer.x + "px";
myPlayer.el.style.top = myPlayer.y + "px";

const otherPlayers = {};

socket.on("currentPlayers", players => {
  for (let id in players) {
    if (id === socket.id) {
      // posição inicial do player local
      myPlayer.x = players[id].x;
      myPlayer.y = players[id].y;

      myPlayer.el.style.left = myPlayer.x + "px";
      myPlayer.el.style.top = myPlayer.y + "px";
    } else {
      createOtherPlayer(id, players[id]);
    }
  }
});


function createOtherPlayer(id, data) {
  const el = document.createElement("div");
  el.className = "player";
  document.body.appendChild(el);

  otherPlayers[id] = {
    el,
    x: data.x,
    y: data.y
  };
}

document.addEventListener("keydown", e => {
  if (!chat.classList.contains("hidden")) return;

  if (e.key === "w") move(0, -5);
  if (e.key === "s") move(0, 5);
  if (e.key === "a") move(-5, 0);
  if (e.key === "d") move(5, 0);
});

socket.on("playerMoved", data => {
  const p = otherPlayers[data.id];
  if (!p) return;

  p.x = data.x;
  p.y = data.y;

  p.el.style.left = p.x + "px";
  p.el.style.top = p.y + "px";
});

socket.on("playerDisconnected", id => {
  if (otherPlayers[id]) {
    otherPlayers[id].el.remove();
    delete otherPlayers[id];
  }
});
socket.on("newPlayer", data => {
  createOtherPlayer(data.id, data);
});

function move(dx, dy) {
  myPlayer.x += dx;
  myPlayer.y += dy;

  myPlayer.el.style.left = myPlayer.x + "px";
  myPlayer.el.style.top = myPlayer.y + "px";

  socket.emit("move", {
    x: myPlayer.x,
    y: myPlayer.y
  });
}
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


//chat
const input = document.getElementById("chatInput");
const messages = document.getElementById("messages");

document.getElementById("send").addEventListener("click", sendMessage);

input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  if (!input.value.trim()) return;

  socket.emit("chatMessage", {
    message: input.value
  });

  input.value = "";
}
socket.on("chatMessage", data => {
  const msg = document.createElement("div");
  msg.textContent = data.id.slice(0, 4) + ": " + data.message;

  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
});

if (data.message.length > 100) return;

const chat = document.getElementById("chat");
const chatToggle = document.getElementById("chatToggle");

chatToggle.addEventListener("click", () => {
  chat.classList.toggle("hidden");
});


