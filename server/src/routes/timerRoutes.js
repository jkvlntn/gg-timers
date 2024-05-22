const { Router } = require("express");
const router = Router();
const timer = require("../objects/timerInstance");

router.post("/start", (req, res, next) => {
  timer.start();
  res.status(200).send();
});

router.post("/pause", (req, res, next) => {
  timer.pause();
  res.status(200).send();
});

router.post("/reset", (req, res, next) => {
  timer.reset();
  res.status(200).send();
});

router.post("/time", (req, res, next) => {
  const timeRemaining = timer.getTimeRemaining();
  res.status(200).json({ time: timeRemaining });
});

module.exports = router;
