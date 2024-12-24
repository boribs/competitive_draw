import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { Room } from "./src/rooms.js";

const app = express();
const server = createServer(app);
app.use("/public", express.static("public"));

const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

app.get("/suggestwords", (req, res) => {
  // TODO: Select words from bigger list!
  res.send(["perezoso", "espantapajaros", "parangaricutirimicuaro"]);
})

const rooms = {};

io.on("connection", (socket) => {
  const auth = socket["handshake"]["auth"]["token"];

  socket.on("join_room", (room) => {
    if (rooms[room] === undefined) {
      rooms[room] = new Room();
      // console.log("created room", room);
    }

    socket.join(room);

    const r = rooms[room];
    r.addConnection(socket);

    io.to(room).emit("player_list", r.getPlayers());

    // TODO: start the game not like this.
    if (r.connections.length == 2) {
      const auth = socket["handshake"]["auth"]["token"];
      io.to(room).emit("new_painter", auth);
    }
  });

  socket.on("disconnecting", () => {
    // assumes that sets always keep the same order!
    const r = Array.from(socket.rooms)[1];
    rooms[r].removeConnection(socket);

    io.to(r).emit("player_list", rooms[r].getPlayers());

    // if empty room
    //   ...
  });

  socket.on("new_word", (word) => {
    socket.broadcast.emit("set_word", word);
    const r = Array.from(socket.rooms)[1];
    rooms[r].setWord(word);
  });
});

server.listen(3000, () => {
  // console.log("server running at http://localhost:3000");
});
