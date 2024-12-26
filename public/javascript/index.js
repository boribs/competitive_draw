const address = window.location.protocol + "//" + window.location.host;

let userName = "";

function nameBoxKeydownHandler(event) {
  const elem = document.getElementById("name-box");

  var r = keydownHandler(event, elem, 13);
  switch(r) {
    case "ret":
      elem.removeChild(elem.lastChild);
      break;

    case "ent":
      var name = "";
      elem.childNodes.forEach((c, i) => {
        if (i != 0) {
          name += c.innerText;
        }
      });
      userName = name;
      disableNameBox();
      break;

    default:
      if (r) { elem.appendChild(createLetterDiv(r)); }
      break;
  }
}

/**
 * Changes the name box to display keyboard action.
 */
function nameBox() {
  const elem = document.getElementById("name-box");

  if (elem.innerText === "ESCRIBE TU NOMBRE") {
    elem.innerText = ">";

    window.addEventListener("keydown", nameBoxKeydownHandler);

    elem.onclick = () => {
      var name = "";
      elem.childNodes.forEach((c, i) => {
        if (i != 0) {
          name += c.innerText;
        }
      });

      if (name.length > 0) {
        userName = name;
        disableNameBox();
      }
    };
  }
}

/**
 * Disables the name box.
 */
function disableNameBox() {
  const nameBox = document.getElementById("name-box");
  window.removeEventListener("keydown", nameBoxKeydownHandler);

  if (nameBox.classList.contains("disabled")) {
    nameBox.onclick = null;
    return;
  }

  Array.from(document.getElementsByClassName("disabled")).forEach((e) => {
    e.classList.remove("disabled");
  });
  nameBox.classList.add("disabled");
}

/**
 * Requests a new room creation, then redirects the user to it.
 */
function createRoom() {
  const newGameButton = document.getElementById("new-game");

  if (newGameButton.classList.contains("disabled")) {
    return;
  }

  fetch(address + "/getroom", {
    method: "POST",
    // false roomId indicates that a new room has to be created.
    body: JSON.stringify({ roomId: false }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then(res => res.json())
  .then(data => {
    document.cookie = `drawingGameUserId=${data["userId"]};`;
    document.cookie = `drawingGameUserName=${userName};`;
    window.location.href = address + "/play/" + data["roomId"];
  });
}

/**
 * Creates a div with the letter-box class and the corresponding text inside.
 * @param {String} char
 */
function createLetterDiv(char) {
  const l = document.createElement("div");
  l.classList.add("letter-box");
  l.innerHTML = char;
  return l;
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
 * Keydown event handler.
 * @param {Event} event
 * @param {HTMLElement} parent
 * @param {number} limit
 *
 * @return {String}
 */
function keydownHandler(event, parent, limit = 10) {
  if (event.keyCode === 8) {
    if (parent.hasChildNodes() && parent.childNodes.length > 1) {
      return "ret";
    }

  } else if (event.keyCode === 13 && parent.children.length > 1) {
    return "ent";

  } else if (
    event.key.length === 1 &&
    parent.children.length < limit &&
    isAlphanumeric(event.key)
  ) {
    return event.key.toUpperCase();
  }
}
