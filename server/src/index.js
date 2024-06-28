const express = require("express");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./socket");
const Bot = require("./bot");
const Timer = require("./timer");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
initializeSocket(server);

const SERVER_PORT = process.env.SERVER_PORT || 8000;
const WEB_PORT = process.env.WEB_PORT || 3000;

app.use(
  cors({
    origin: `http://localhost:${WEB_PORT}`,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} : ${req.url}`);
  next();
});

app.get("/timer/time", (req, res, next) => {
  const timeRemaining = timer.getTimeRemaining();
  const paused = timer.isPaused();
  res.status(200).json({ time: timeRemaining, paused: paused });
});

server.listen(SERVER_PORT, () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});

const timer = new Timer(15 * 60);
const bot1 = new Bot(
  process.env.DISCORD1_TOKEN,
  process.env.DISCORD1_ID,
  timer
);
const bot2 = new Bot(
  process.env.DISCORD2_TOKEN,
  process.env.DISCORD2_ID,
  timer
);
// timer.registerBot(bot1);
// timer.registerBot(bot2);
