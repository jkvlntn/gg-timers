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
      console.log("time on server: " + this.timeRemaining);
    }, 1000);
  }
  pause() {
    this.paused = true;
    this.interval = clearInterval(this.interval);
  }
  reset() {
    this.paused = true;
    this.interval = clearInterval(this.interval);
    this.timeRemaining = this.initialTime;
  }
  getTimeRemaining() {
    return this.timeRemaining;
  }
  isPaused() {
    return this.paused;
  }
};

module.exports = new Timer(15 * 60);
