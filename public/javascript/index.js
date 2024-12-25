const address = window.location.protocol + "//" + window.location.host;

/**
 *
 */
function nameBox() {
  const elem = document.getElementById("name-box");

  if (elem.innerText === "ESCRIBE TU NOMBRE") {
    elem.innerText = ">";
    window.addEventListener("keydown", keydownListener);
    elem.onclick = () => {
      var name = "";
      elem.childNodes.forEach((c, i) => {
        if (i != 0) {
          name += c.innerText;
        }
      });
      submitName(name);
    };
  }
}

/**
 *
 */
function submitName(name) {
  window.removeEventListener("keydown", keydownListener);

  Array.from(document.getElementsByClassName("disabled")).forEach((e) => {
    e.classList.remove("disabled");
  });

  document.getElementById("name-box").classList.add("disabled");

  fetch(address + "/createroom", {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then(res => res.json())
  .then(data => {
    document.cookie = `drawingGameUserId=${data["userId"]};`;
    document.cookie = `drawingGameUserName=${name};`;
    window.location.href = address + "/play/" + data["roomId"];
  });
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
  const parent = document.getElementById("name-box");

  if (event.keyCode === 8) {
    if (parent.hasChildNodes() && parent.childNodes.length > 1) {
      parent.removeChild(parent.lastChild);
    }

  } else if (event.keyCode === 13 && parent.children.length > 1) {
    window.removeEventListener("keydown", keydownListener);

    var name = "";
    parent.childNodes.forEach((c, i) => {
      if (i != 0) {
        name += c.innerText;
      }
    });

    submitName(name);

  } else if (
    event.key.length === 1 &&
    parent.children.length < 13 &&
    isAlphanumeric(event.key)
  ) {
    const l = document.createElement("div");
    l.classList.add("letter-box");
    l.innerHTML = event.key.toUpperCase();
    parent.appendChild(l);
  }
}
