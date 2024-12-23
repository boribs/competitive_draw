import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
app.use("/public", express.static("public"));

const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

io.on('connection', (socket) => {
  console.log('a user connected', socket['handshake']['auth']['token']);
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
