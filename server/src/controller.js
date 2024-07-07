const Timer = require("./timer");
const { emitSocket } = require("./socket");

class Controller {
  constructor(identifier) {
    this.identifier = identifier;
    this.timer = new Timer(
      900,
      () => {
        this.updateEmbeds();
      },
      () => {
        this.playAudio("./audio/finished.mp3");
        emitSocket(`update${this.identifier}`);
      }
    );
    this.bots = [];
  }
  registerBot(bot) {
    this.bots.push(bot);
  }
  start() {
    this.playAudio("./audio/start.mp3");
    this.timer.start();
    emitSocket(`update${this.identifier}`);
  }
  pause() {
    this.timer.pause();
    emitSocket(`update${this.identifier}`);
    this.updateEmbeds();
    this.playAudio("./audio/pause.mp3");
  }
  reset() {
    this.timer.reset();
    this.updateEmbeds();
    emitSocket(`update${this.identifier}`);
  }
  set(timeToSet) {
    this.timer.set(timeToSet);
    this.updateEmbeds();
    emitSocket(`update${this.identifier}`);
  }
  getIdentifier() {
    return this.identifier;
  }
  playAudio(audioFile) {
    this.bots.map((bot) => bot.playAudio(audioFile));
  }
  updateEmbeds() {
    for (let x = 0; x < this.bots.length; x++) {
      this.bots[x].updateEmbed(
        this.timer.getMinutesRemaining(),
        this.timer.getSecondsRemaining()
      );
    }
  }
  getTimeString() {
    return `${this.timer.getMinutesRemaining()} minutes ${this.timer.getSecondsRemaining()} seconds`;
  }

  getTimerTime() {
    return this.timer.getTimeRemaining();
  }

  isTimerPaused() {
    return this.timer.isPaused();
  }

  async initializeAll() {
    await Promise.all(this.bots.map((bot) => bot.initialize()));
  }

  async clearAll() {
    await Promise.all(this.bots.map((bot) => bot.clear()));
  }
}

module.exports = Controller;
