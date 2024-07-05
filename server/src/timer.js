const Timer = class {
  constructor(initialTime, updateCallback, finishedCallback) {
    this.initialTime = initialTime;
    this.updateCallback = updateCallback;
    this.finishedCallback = finishedCallback;
    this.timeRemaining = initialTime;
    this.paused = true;
    this.interval = null;
  }
  start() {
    if (!this.paused || this.timeRemaining <= 0) {
      return;
    }
    this.paused = false;
    this.interval = setInterval(() => {
      this.timeRemaining -= 1;
      this.updateCallback();
      console.log("time on server: " + this.timeRemaining);
      if (this.timeRemaining === 0) {
        this.paused = true;
        this.interval = clearInterval(this.interval);
        this.finishedCallback();
      }
    }, 1000);
  }
  pause() {
    if (this.paused) {
      return;
    }
    this.paused = true;
    this.interval = clearInterval(this.interval);
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
  getMinutesRemaining() {
    return Math.floor(this.timeRemaining / 60);
  }
  getSecondsRemaining() {
    return this.timeRemaining % 60;
  }
  isPaused() {
    return this.paused;
  }
};

module.exports = Timer;
