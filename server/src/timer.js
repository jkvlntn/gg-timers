const { emitSocket } = require("./socket");

const Timer = class {
  constructor(initialTime) {
    this.initialTime = initialTime;
    this.timeRemaining = initialTime;
    this.paused = true;
    this.interval = null;
    this.bots = [];
  }
  registerBot(bot) {
    this.bots.push(bot);
  }
  start() {
    if (!this.paused || this.timeRemaining <= 0) {
      return;
    }
    for (let x = 0; x < this.bots.length; x++) {
      this.bots[x].startVoiceLine();
    }
    this.paused = false;
    this.interval = setInterval(() => {
      this.timeRemaining -= 1;
      for (let x = 0; x < this.bots.length; x++) {
        this.bots[x].updateEmbed();
      }
      console.log("time on server: " + this.timeRemaining);
      if (this.timeRemaining == 0) {
        this.paused = true;
        this.interval = clearInterval(this.interval);
        emitSocket("update");
        for (let x = 0; x < this.bots.length; x++) {
          this.bots[x].finishedVoiceLine();
        }
      }
    }, 1000);
    emitSocket("update");
  }
  pause() {
    if (this.paused) {
      return;
    }
    this.paused = true;
    this.interval = clearInterval(this.interval);
    emitSocket("update");
    for (let x = 0; x < this.bots.length; x++) {
      this.bots[x].pauseVoiceLine();
    }
  }
  reset() {
    this.paused = true;
    this.interval = clearInterval(this.interval);
    this.timeRemaining = this.initialTime;
    emitSocket("update");
  }
  set(timeToSet) {
    this.paused = true;
    this.interval = clearInterval(this.interval);
    this.timeRemaining = timeToSet;
    emitSocket("update");
  }
  getTimeRemaining() {
    return this.timeRemaining;
  }
  isPaused() {
    return this.paused;
  }
};

module.exports = Timer;
