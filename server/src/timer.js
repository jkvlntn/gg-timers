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
  start(onFinish) {
    if (!this.paused) {
      return;
    }
    for (let x = 0; x < this.bots.length; x++) {
      this.bots[x].startVoiceLine();
    }
    this.paused = false;
    this.interval = setInterval(() => {
      this.timeRemaining -= 1;
      console.log("time on server: " + this.timeRemaining);
      if (this.timeRemaining == 0) {
        this.paused = true;
        this.interval = clearInterval(this.interval);
        for (let x = 0; x < this.bots.length; x++) {
          this.bots[x].finishedVoiceLine();
        }
        onFinish();
      }
    }, 1000);
  }
  pause() {
    if (this.paused) {
      return;
    }
    this.paused = true;
    this.interval = clearInterval(this.interval);
    for (let x = 0; x < this.bots.length; x++) {
      this.bots[x].pauseVoiceLine();
    }
  }
  reset() {
    this.paused = true;
    this.interval = clearInterval(this.interval);
    this.timeRemaining = this.initialTime;
  }
  set(timeToSet) {
    this.paused = true;
    this.interval = clearInterval(this.interval);
    this.timeRemaining = timeToSet;
  }
  getTimeRemaining() {
    return this.timeRemaining;
  }
  isPaused() {
    return this.paused;
  }
};

module.exports = Timer;
