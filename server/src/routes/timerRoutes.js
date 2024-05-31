const { Router } = require("express");
const router = Router();
const timer = require("../objects/timerInstance");

router.post("/start", (req, res, next) => {
  timer.start();
  req.emit("update");
  res.status(200).send();
});

router.post("/pause", (req, res, next) => {
  timer.pause();
  req.emit("update");
  res.status(200).send();
});

router.post("/reset", (req, res, next) => {
  timer.reset();
  req.emit("update");
  res.status(200).send();
});

router.get("/time", (req, res, next) => {
  const timeRemaining = timer.getTimeRemaining();
  const paused = timer.isPaused();
  res.status(200).json({ time: timeRemaining, paused: paused });
});

module.exports = router;
