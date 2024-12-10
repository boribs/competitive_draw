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

  constructor(color, ctx) {
    this.color = color;
    this.ctx = ctx;
  }

  /**
   * (x, y) in canvas.
   * basically "mousedown"
   */
  onClick(x, y) {
    throw new UnimplementedError('onClick()');
  }

  onHold(x, y) {
    throw new UnimplementedError('onHold()');
  }

  /**
   * basically "mouseup"
   */
  onRelease(x, y) {
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

  constructor(ctx, color = "#abca00", thickness = 3) {
    super(color, ctx);
    this.thickness = thickness;
  }

  onClick(x, y) {
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.thickness;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + 1, y + 1);
    this.ctx.stroke();

    this.#lastDot.x = x;
    this.#lastDot.y = y;
  }

  onRelease(x, y) { ; }

  onHold(x, y) {
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.thickness;

    this.ctx.beginPath();
    this.ctx.moveTo(this.#lastDot.x, this.#lastDot.y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.#lastDot.x = x;
    this.#lastDot.y = y;
  }
}

export { Pencil };
