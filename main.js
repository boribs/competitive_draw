import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
import { Room } from "./src/rooms.js";

const app = express();
app.use("/public", express.static("public"));
app.use(express.json({ limit: '100mb' }));

const server = createServer(app);
const io = new Server(server);

const userPool = new Set();
const userNames = {};
const roomPool = new Set();
const rooms = {};

const __dirname = dirname(fileURLToPath(import.meta.url));
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

app.get("/suggestwords", (req, res) => {
  // TODO: Select words from bigger list!
  res.send(["perezoso", "espantapajaros", "parangaricutirimicuaro"]);
})

app.post("/getroom", (req, res) => {
  /**
   * @param {Set} pool
   */
  function randomId(pool) {
    var id = Math.floor(Math.random() * 10000);

    while (pool.has(id)) {
      id = Math.floor(Math.random() * 10000);
    }

    return id;
  }

  var roomId = req.body["roomId"];
  if (roomId === undefined) {
    console.error("'roomId' not present in request body", req.body);
    res.status(404).send();
    return;
  }

  if (roomId === false) {
    roomId = "r" + randomId(roomPool);
    roomPool.add(roomId);
    rooms[roomId] = new Room();
    console.log("Created room:", roomId);

  } else if (!roomPool.has(roomId)) {
    console.error("Nonexistant roomId:", roomId);
    res.status(404).send();
    return;
  }

  var userId = randomId(userPool);

  res.status(201).send({
    userId: userId,
    roomId: roomId,
  });
});

app.get("/play/:room", (req, res) => {
  if (rooms[req.params["room"]] === undefined) {
    res.status(404).send("not found bby");
  } else {
    res.sendFile(join(__dirname, "public", "draw.html"));
  }
});


io.on("connection", (socket) => {
  const auth = socket["handshake"]["auth"]["token"];
  const [userId, userName] = auth.split(";");

  // prevent users from logging in twice
  if (userPool.has(userId)) {
    socket.disconnect(true);
    console.log("user", userId, "is already connected.");
    // redirect to main page
  }

  userPool.add(userId);
  userNames[userId] = userName;

  socket["userId"] = userId;
  socket["userName"] = userName;

  socket.on("join_room", (room) => {
    console.log("joining:", room);

    socket.join(room);

    // TODO: Fix crash when not found.
    const r = rooms[room];
    r.addConnection(socket);

    io.to(room).emit("player_list", r.getPlayers());

    // TODO: start the game not like this.
      io.to(room).emit("new_painter", socket["userId"]);
    }
  });

  socket.on("disconnecting", () => {
    // console.log("user", socket["userId"], "is disconnecting");

    // assumes that sets always keep the same order!
    const r = Array.from(socket.rooms)[1];
    rooms[r].removeConnection(socket);

    userPool.delete(socket["userId"]);

    io.to(r).emit("player_list", rooms[r].getPlayers());

    // if empty room
    //   ...
  });

  socket.on("new_word", (word) => {
    socket.broadcast.emit("set_word", word);
    const r = Array.from(socket.rooms)[1];
    rooms[r].setWord(word);
  });

  socket.on("chat", (text) => {
    const r = Array.from(socket.rooms)[1];
    const guessed = rooms[r].confirmGuess(text);

    io.to(r).emit("chat", {
      sender: socket["userName"],
      color: socket["color"],
      text: guessed ? "adivinó la palabra!" : text, // TODO: pls not like this
      guessed: guessed,
    });
  });
});

server.listen(3000, () => {
  // console.log("server running at http://localhost:3000");
});
