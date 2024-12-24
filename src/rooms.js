import { Socket } from "socket.io";

/**
 *
 */
class Room {
  constructor() {
    this.connections = [];
    this.drawing = -1;
  }

  /**
   * @param {Socket} socket
   */
  addConnection(socket) {
    this.connections.push(socket);
  }

  /**
   * @param {Socket} socket
   */
  removeConnection(socket) {
    const i = this.connections.find((e) => {
      socket === e
    });
    this.connections.splice(i, 1);
    // deal with turns
  }

  /**
   *
   */
  start() {
    this.drawing = 0;
    // notify everyone that 0th connection is now drawing
  }

  /**
   *
  */
 nextTurn() {
   this.drawing = (this.drawing + 1) % this.connections.length;
   // notify everyone that `this.drawing`th connection is now drawing
  }
}

export { Room };
