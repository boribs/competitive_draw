/**
 * https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 */
class UnimplementedError extends Error {
  constructor(message) {
    super(message)

    // needed for UnimplementedError instanceof Error => true
    Object.setPrototypeOf(this, new.target.prototype);

    // Set the name
    this.name = this.constructor.name

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * Base class for every drawing tool avaliable.
 */
class DrawingTool {
  color = "#000000";

  constructor(color) {
    this.color = color;
  }

  /**
   * (x, y) in canvas.
   * basically "mousedown"
   */
  onClick(x, y, ctx) {
    throw new UnimplementedError('onClick()');
  }

  onHold(x, y, ctx) {
    throw new UnimplementedError('onHold()');
  }

  /**
   * basically "mouseup"
   */
  onRelease(x, y, ctx) {
    throw new UnimplementedError('onRelease()');
  }
}

/**
 * Pencil - the default drawing tool.
 */
class Pencil extends DrawingTool {
  thickness = 10;
  #lastDot = {
    x: 0,
    y: 0,
  };

  constructor(color = "#abca00", thickness = 3) {
    super(color);
    this.thickness = thickness;
  }

  onClick(x, y, ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;

    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();

    this.#lastDot.x = x;
    this.#lastDot.y = y;
  }

  onRelease(x, y, ctx) { ; }

  onHold(x, y, ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;

    ctx.moveTo(this.#lastDot.x, this.#lastDot.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    this.#lastDot.x = x;
    this.#lastDot.y = y;
  }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tool = new Pencil();
const dbg = document.getElementById("dbg");

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

function mousedownHandler(event) {
  let rect = canvas.getBoundingClientRect();

  if (!mouseDown && withinCanvas(event, rect)) {
    let x = event.x - rect.x, y = event.y - rect.y;

    tool.onClick(x, y, ctx);
    // console.log("click");
  }
  mouseDown = true;
}

function mousemoveHandler(event) {
  let rect = canvas.getBoundingClientRect();

  if (mouseDown && withinCanvas(event, rect)) {
    let x = event.x - rect.x, y = event.y - rect.y;

    tool.onHold(x, y, ctx);
    // console.log("hold");
  }
}

function mouseupHandler(event) {
  mouseDown = false;
  tool.onRelease(event.x, event.y, ctx);
  console.log("release");
}

document.addEventListener("mousedown", mousedownHandler);
document.addEventListener("mouseup", mouseupHandler);
document.addEventListener("mousemove", mousemoveHandler);
