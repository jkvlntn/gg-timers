const express = require("express");
const timerRoutes = require("./routes/timerRoutes");
const timer = require("./objects/timerInstance");

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.use((req, res, next) => {
  console.log(`${req.method} : ${req.url}`);
  next();
});

app.use("/timer", timerRoutes);
