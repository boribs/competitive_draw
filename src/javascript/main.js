// expressjs stuff
// server invocation

function handleSubmit(e) {
  if (e.key === "Enter") {
    const text = e.explicitOriginalTarget.value;
    console.log(text);
    e.explicitOriginalTarget.value = "";
  }
}

document.getElementById("chat-textbox").addEventListener("keydown", handleSubmit);
