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
