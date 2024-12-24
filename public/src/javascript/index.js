import { Pencil, Eraser } from "./draw.js";
import "./socket.io.js";

const address = window.location.protocol + "//" + window.location.host;
const urlParams = new URLSearchParams(window.location.search);

const socket = io({
  auth: {
    token: urlParams.get("name"),
  }
});

socket.on("connect", () => {
  socket.emit("join_room", "room:A");
});

socket.on("player_list", (players) => {
  document.getElementById("leaderboard-holder").replaceChildren();

  players.forEach((player) => {
    var [name, score] = player;
    addPlayerBanner(name, score);
  });
});

socket.on("new_painter", (who) => {
  console.log("new painter:", who);

  if (urlParams.get("name") === who) {
    suggestWords();
  }
});

socket.on("set_word", (word) => {
  setWord(word, false);
});

socket.on("chat", (data) => {
  createChatBlob(data);
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const TOOLS = {
  "toolbox-pencil": new Pencil(ctx),
  "toolbox-eraser": new Eraser(ctx),
};

const toolHint = document.getElementById("canvas-tool-hint");
let tool = TOOLS["toolbox-pencil"];
setToolHintIcon("toolbox-pencil");

/**
 * Helper function to create elements fast.
 * @param {String} type
 * @param {String | null} id
 * @param {String[] | null} classes
 *
 * @return {HTMLElement}
 */
function createElement(type, id = null, classes = null) {
  var elem = document.createElement(type);
  if (id) { elem.id = id; }
  if (classes) { elem.classList.add(classes); }
  return elem;
}

/**
 * Sets the tool hint to the correct icon.
 * @param {String} toolId
 */
function setToolHintIcon(toolId) {
  const icon = toolId.slice(8);
  toolHint.children[0].setAttribute("src", `public/static/${icon}.png`);
}

/**
 * @param {String} word The word to be set for the players to guess
 * @param {bool} fill Fill letters in word?
 */
function setWord(word, fill = false) {
  const wd = document.getElementById("word-display");
  wd.replaceChildren();

  Array.from(word).forEach((l, i) => {
    const d = document.createElement("div");
    d.classList.add("letter-box");
    d.id = `letter-${i}`;

    if (fill) {
      d.innerText = l;
    }

    wd.appendChild(d);
  });
}

/**
 * GUI display of player banner
 * @param {String} name
 * @param {String} score
 */
function addPlayerBanner(name, score) {
  const parent = document.getElementById("leaderboard-holder");
  const holder = createElement("div", `player-${name}`, ["leaderboard-player-holder"]);
  const imgHolder = createElement("div", null, ["leaderboard-player-image"]);
  const img = createElement("img");
  img.src = "#";
  imgHolder.appendChild(img);
  holder.appendChild(imgHolder);

  const data = createElement("div", null, ["leaderboard-player-data"]);
  const playerName = createElement("div", null, ["leaderboard-player-name"]);
  playerName.innerText = name;
  const playerScore = createElement("div", null, ["leaderboard-player-score"]);
  playerScore.innerText = score;
  data.appendChild(playerName);
  data.appendChild(playerScore);
  holder.appendChild(data);

  parent.appendChild(holder);
}

/**
 * GUI display of suggested words.
 */
async function suggestWords() {
  const words = await fetch(address + "/suggestwords").then(res => res.json());
  const parent = document.getElementById("word-display");
  parent.replaceChildren();
  parent.classList.add("selecting");

  words.forEach((w) => {
    const s = document.createElement("div");
    s.classList.add("word-suggestion");
    if (w.length > 16) { s.classList.add("word-small"); }
    s.innerText = w.toUpperCase();
    s.onclick = () => {
      parent.replaceChildren();
      parent.classList.remove("selecting");
      setWord(s.innerText, true);

      socket.emit("new_word", s.innerText);
    }

    parent.appendChild(s);
  });

  const o = document.createElement("div");
  o.classList.add("word-suggestion");
  o.id = "other-word";
  o.innerText = "OTRO";
  o.onclick = () => {
    parent.replaceChildren();

    document.getElementById("chat-textbox").disabled = true;

    const l = document.createElement("div");
    l.innerText = "ESCRIBE TU PALABRA:";
    l.classList.add("first-letter");
    parent.appendChild(l);
    parent.classList.remove("selecting");

    document.addEventListener("keydown", keydownListener);
  }
  parent.appendChild(o);
}

/**
 * mouse controls.
 */
let mouseDown = false;

/**
 * @param {Event} event
 * @param {DOMRect} rect
 * @return {bool} Whether the event was executed within the canvas space.
 */
function withinCanvas(event, rect) {
  return event.x >= rect.x &&
    event.x <= (rect.x + rect.width - 2) &&
    event.y >= rect.y &&
    event.y <= (rect.y + rect.height - 2);
}

/**
 * Converts screen-pixel position to canvas logical position.
 * @param {Event} event
 * @param {DOMRect} rect
 * @return {number[]}
 */
function calculateCanvasPos(event, rect) {
  const ix = ((event.x - rect.x) / rect.width) * canvas.width,
    iy = ((event.y - rect.y) / rect.height) * canvas.height;

  return [ix, iy];
}

/**
 * Handles the mousedown event.
 * @param {Event} event
 */
function mousedownHandler(event) {
  let rect = canvas.getBoundingClientRect();

  if (!mouseDown && withinCanvas(event, rect)) {
    let [x, y] = calculateCanvasPos(event, rect);

    tool.onClick(x, y, ctx);
    // console.log("click");
  }
  mouseDown = true;
}

/**
 * Handles the mousemove event.
 * @param {Event} event
 */
function mousemoveHandler(event) {
  let rect = canvas.getBoundingClientRect();

  if (withinCanvas(event, rect)) {
    toolHint.style.left = `${event.x + 4}px`;
    toolHint.style.top = `${event.y - 20}px`;
    toolHint.style.visibility = "visible";

    if (mouseDown) {
      let [x, y] = calculateCanvasPos(event, rect);

      tool.onHold(x, y, ctx);
    } else {
      mouseDown = false;
      tool.onRelease(event.x, event.y, ctx);
    }
  } else {
    toolHint.style.visibility = "hidden";
  }
}

/**
 * Handles the mouseup event.
 * @param {Event} event
 */
function mouseupHandler(event) {
  mouseDown = false;
  tool.onRelease(event.x, event.y, ctx);
  // console.log("release");
}

/**
 * Checks whether a string is alphanumeric.
 * @param {String} str
 * @return {bool}
 */
function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Keydown event listener for when writing a custom word.
 * @param {Event} event
 */
function keydownListener(event) {
  const parent = document.getElementById("word-display");

  if (event.keyCode === 8) {
    if (parent.hasChildNodes()) {
      parent.removeChild(parent.lastChild);
    }

  } else if (event.keyCode === 13 && parent.children.length > 1) {
    document.removeEventListener("keydown", keydownListener);
    document.getElementById("chat-textbox").disabled = false;

    var word = "";
    parent.childNodes.forEach((c) => {
      word += c.innerText;
    });

    socket.emit("new_word", word);

  } else if (
    event.key.length === 1 &&
    parent.children.length < 24 &&
    isAlphanumeric(event.key)
  ) {
    if (parent.hasChildNodes() && parent.childNodes[0].classList.contains("first-letter")) {
      parent.replaceChildren();
    }

    const l = document.createElement("div");
    l.classList.add("letter-box");
    l.innerHTML = event.key.toUpperCase();
    parent.appendChild(l);
  }
}

/**
 * Submit listener for chat box.
 * @param {Event} event
 */
function chatBoxSubmitListener(event) {
  if (event.key === "Enter") {
    const text = event.explicitOriginalTarget.value;
    socket.emit("chat", text);
    event.explicitOriginalTarget.value = "";
  }
}

/**
 * Creates chat DOM elements.
 */
function createChatBlob(data) {
  const blob = createElement("p", null, data["guessed"] ? ["guessed"] : null);
  const span = "<span class=\"player-" + data["color"] + "\">" + data["sender"] + "</span>";
  blob.innerHTML = span + (data["guessed"] ? " " : ": ") + data["text"];
  document.getElementById("chat-holder-inner").appendChild(blob);

  const scroll = document.getElementById("chat-holder-messages");
  scroll.scrollTo(0, scroll.scrollHeight);
}

document.getElementById("chat-textbox").addEventListener("keydown", chatBoxSubmitListener);
canvas.addEventListener("mousedown", mousedownHandler);
canvas.addEventListener("mouseup", mouseupHandler);
document.addEventListener("mousemove", mousemoveHandler);

/**
 * Tool changes!
 */
["toolbox-pencil", "toolbox-eraser"].forEach((id) => {
  document.getElementById(id).onclick = () => {
    tool = TOOLS[id];
    setToolHintIcon(id);
  };
})

/**
 * Color changes!
 */
Array.from(document.getElementsByClassName("toolbox-color")).forEach((elem) => {
  elem.onclick = () => {
    tool.changeColor(elem.style.background);
  }
});
