const express = require("express");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./socket");
const Bot = require("./bot");
const Controller = require("./controller");
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

app.get("api/time", (req, res, next) => {
  // const timeRemaining = timer1.getTimeRemaining();
  // const paused = timer1.isPaused();
  // res.status(200).json({ time: timeRemaining, paused: paused });
  // res.status(200).json({ bob: 100 });
});

server.listen(SERVER_PORT, () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});

const controller1 = new Controller("Match 1");
const controller2 = new Controller("Match 2");

const bot1 = new Bot(
  controller1,
  process.env.DISCORD1_TOKEN,
  process.env.DISCORD1_ID,
  process.env.DISCORD1_CHANNEL_ID || null,
  false
);

const bot2 = new Bot(
  controller1,
  process.env.DISCORD2_TOKEN,
  process.env.DISCORD2_ID,
  process.env.DISCORD2_CHANNEL_ID || null,
  true
);
