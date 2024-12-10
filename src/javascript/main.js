// expressjs stuff
// server invocation

import { Pencil, Eraser } from "./draw.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const TOOLS = {
  "toolbox-pencil": new Pencil(ctx),
  "toolbox-eraser": new Eraser(ctx),
};
let tool = TOOLS["toolbox-pencil"];

/**
 * @param {String} word The word to be set for the players to guess
 * @param {bool} fill Fill letters in word?
 */
function setWord(word, fill) {
  const wd = document.getElementById("word-display");

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

// setWord("PARANGARICUTIRIMICUARO");

/**
 * GUI display of suggested words.
 * *INCOMPLETE*
 */
function suggestWords() {
  // request words
  const words = ["perezoso", "espantapajaros", "parangaricutirimicuaro"];
  const parent = document.getElementById("word-display");
  parent.classList.add("selecting");

  words.forEach((w) => {
    const s = document.createElement("div");
    s.classList.add("word-suggestion");
    if (w.length > 16) { s.classList.add("word-small"); }
    s.innerText = w.toUpperCase();
    s.onclick = () => {
      console.log("selected: ", s.innerText);
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

suggestWords();

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

  if (mouseDown && withinCanvas(event, rect)) {
    let [x, y] = calculateCanvasPos(event, rect);

    tool.onHold(x, y, ctx);
    // console.log("hold");
  } else {
    mouseDown = false;
    tool.onRelease(event.x, event.y, ctx);
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
    // TODO: Notify server!

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
    const text = e.explicitOriginalTarget.value;
    console.log(text);
    // TODO: Notify server
    e.explicitOriginalTarget.value = "";
  }
}

document.getElementById("chat-textbox").addEventListener("keydown", chatBoxSubmitListener);
canvas.addEventListener("mousedown", mousedownHandler);
canvas.addEventListener("mouseup", mouseupHandler);
canvas.addEventListener("mousemove", mousemoveHandler);

/**
 * Tool changes!
 */
["toolbox-pencil", "toolbox-eraser"].forEach((id) => {
  document.getElementById(id).onclick = () => {
    tool = TOOLS[id];
  };
})

/**
 * Color changes!
 */
Array.from(document.getElementsByClassName("toolbox-color")).forEach((e) => {
  e.onclick = () => {
    tool.changeColor(e.style.background);
  }
});
