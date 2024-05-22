const express = require("express");
const cors = require("cors");
const timerRoutes = require("./routes/timerRoutes");
const timer = require("./objects/timerInstance");

const app = express();
const SERVER_PORT = 8000;
const WEB_PORT = 3000;

app.listen(SERVER_PORT, () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});

app.use(
  cors({
    origin: `http://localhost:${WEB_PORT}`,
    credentials: true,
  })
);

// app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} : ${req.url}`);
  next();
});

app.use("/timer", timerRoutes);
