const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
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

app.use(express.static(path.join(__dirname, "../../app/build")));
app.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../../app/build", "index.html"));
});

server.listen(SERVER_PORT, () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});

const controllers = new Map();
controllers.set("1", new Controller("1"));
controllers.set("2", new Controller("2"));

const ref1 = new Bot(
  controllers.get("1"),
  process.env.DISCORD1_TOKEN,
  process.env.DISCORD1_ID,
  process.env.DISCORD1_CHANNEL_ID || null,
  true
);

const arm = new Bot(
  controllers.get("2"),
  process.env.DISCORD2_TOKEN,
  process.env.DISCORD2_ID,
  process.env.DISCORD2_CHANNEL_ID || null,
  true
);

// const hug = new Bot(
//   controllers.get("1"),
//   process.env.DISCORD3_TOKEN,
//   process.env.DISCORD3_ID,
//   process.env.DISCORD3_CHANNEL_ID || null,
//   false
// );

// const ref2 = new Bot(
//   controllers.get("2"),
//   process.env.DISCORD4_TOKEN,
//   process.env.DISCORD4_ID,
//   process.env.DISCORD4_CHANNEL_ID || null,
//   true
// );

// const ind = new Bot(
//   controllers.get("2"),
//   process.env.DISCORD5_TOKEN,
//   process.env.DISCORD5_ID,
//   process.env.DISCORD5_CHANNEL_ID || null,
//   false
// );

// const long = new Bot(
//   controllers.get("2"),
//   process.env.DISCORD6_TOKEN,
//   process.env.DISCORD6_ID,
//   process.env.DISCORD6_CHANNEL_ID || null,
//   false
// );
