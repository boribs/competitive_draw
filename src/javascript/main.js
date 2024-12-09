// expressjs stuff
// server invocation

import { Pencil } from "./draw.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tool = new Pencil(ctx);

function handleSubmit(e) {
  if (e.key === "Enter") {
    const text = e.explicitOriginalTarget.value;
    console.log(text);
    e.explicitOriginalTarget.value = "";
  }
}

document.getElementById("chat-textbox").addEventListener("keydown", handleSubmit);

/**
 * @param word string
 * ...
 */
function setWord(word) {
  const wd = document.getElementById("word-display");

  Array.from(word).forEach((l, i) => {
    const d = document.createElement("div");
    d.classList.add("letter-box");
    d.id = `letter-${i}`;
    d.innerText = l;
    wd.appendChild(d);
  });
}

setWord("PALABRA");

/**
 * mouse controls.
 */
let mouseDown = false;

function withinCanvas(event, rect) {
  return event.x >= rect.x &&
    event.x <= (rect.x + rect.width - 2) &&
    event.y >= rect.y &&
    event.y <= (rect.y + rect.height - 2);
}

function calculateCanvasPos(event, rect) {
  const ix = ((event.x - rect.x) / rect.width) * canvas.width,
        iy = ((event.y - rect.y) / rect.height) * canvas.height;

  return [ix, iy];
}

function mousedownHandler(event) {
  let rect = canvas.getBoundingClientRect();

  if (!mouseDown && withinCanvas(event, rect)) {
    let [x, y] = calculateCanvasPos(event, rect);

    tool.onClick(x, y, ctx);
    // console.log("click");
  }
  mouseDown = true;
}

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

function mouseupHandler(event) {
  mouseDown = false;
  tool.onRelease(event.x, event.y, ctx);
  // console.log("release");
}

canvas.addEventListener("mousedown", mousedownHandler);
canvas.addEventListener("mouseup", mouseupHandler);
canvas.addEventListener("mousemove", mousemoveHandler);
