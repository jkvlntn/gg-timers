const Timer = class {
  constructor(initialTime) {
    this.initialTime = initialTime;
    this.timeRemaining = initialTime;
    this.paused = true;
    this.interval = null;
  }
  start() {
    this.paused = false;
    this.interval = setInterval(() => {
      this.timeRemaining -= 1;
      console.log("decreasing timer " + this.timeRemaining);
    }, 1000);
  }
  pause() {
    this.paused = true;
    this.interval = clearInterval(this.interval);
  }
  reset() {
    this.timeRemaining = this.initialTime;
    this.interval = clearInterval(this.interval);
  }
  getTimeRemaining() {
    return this.timeRemaining;
  }
  isPaused() {
    return this.paused;
  }
};

module.exports = Timer;
