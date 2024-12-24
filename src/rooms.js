import { Socket } from "socket.io";

/**
 *
 */
class Room {
  constructor() {
    this.connections = [];
    this.drawing = -1;
    this.word = "";
    this.scores = {};
  }

  /**
   *
   */
  getPlayers() {
    const r = this;
    return this.connections.map((c) => {
      var name = c["handshake"]["auth"]["token"];
      return [name, r.scores[name]];
    }).sort((a, b) => {
      return b[1] - a[1];
    });
  }

  /**
   * @param {Socket} socket
   */
  addConnection(socket) {
    this.connections.push(socket);
    this.scores[socket["handshake"]["auth"]["token"]] = 0;
  }

  /**
   * @param {Socket} socket
   */
  removeConnection(socket) {
    const i = this.connections.indexOf(socket);
    this.connections.splice(i, 1);
    delete this.scores[socket["handshake"]["auth"]["token"]];

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

  /**
   * @param {String} word
   */
  setWord(word) {
    this.word = word;
  }
}

export { Room };
