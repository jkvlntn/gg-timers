const { Router } = require("express");
const router = Router();
const timer = require("./timer");
const { emitSocket } = require("./socket");

router.post("/start", (req, res, next) => {
  timer.start();
  emitSocket("update");
  res.status(200).send();
});

router.post("/pause", (req, res, next) => {
  timer.pause();
  emitSocket("update");
  res.status(200).send();
});

router.post("/reset", (req, res, next) => {
  timer.reset();
  emitSocket("update");
  res.status(200).send();
});

router.get("/time", (req, res, next) => {
  const timeRemaining = timer.getTimeRemaining();
  const paused = timer.isPaused();
  res.status(200).json({ time: timeRemaining, paused: paused });
});

module.exports = router;
