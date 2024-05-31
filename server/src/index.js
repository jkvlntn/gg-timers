const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const timerRoutes = require("./routes/timerRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const SERVER_PORT = 8000;
const WEB_PORT = 3000;

app.use(
  cors({
    origin: `http://localhost:${WEB_PORT}`,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} : ${req.url}`);
  if (req.method == "POST") {
    req.emit = (e) => {
      io.emit(e);
    };
  }
  next();
});

app.use("/timer", timerRoutes);

server.listen(SERVER_PORT, () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});
