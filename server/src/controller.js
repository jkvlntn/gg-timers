const Timer = require("./timer");
const { addSocketHandler, emitSocket } = require("./socket");

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
        this.emitTime();
      }
    );
    this.bots = [];
    addSocketHandler(`get${identifier}`, this.emitTime.bind(this));
  }
  registerBot(bot) {
    this.bots.push(bot);
  }
  start() {
    this.playAudio("./audio/start.mp3");
    this.timer.start();
    this.emitTime();
  }
  pause() {
    this.timer.pause();
    this.emitTime();
    this.updateEmbeds();
    this.playAudio("./audio/pause.mp3");
  }
  reset() {
    this.timer.reset();
    this.updateEmbeds();
    this.emitTime();
  }
  set(timeToSet) {
    this.timer.set(timeToSet);
    this.updateEmbeds();
    this.emitTime();
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

  async initializeAll() {
    await Promise.all(this.bots.map((bot) => bot.initialize()));
  }

  async clearAll() {
    await Promise.all(this.bots.map((bot) => bot.clear()));
  }

  emitTime() {
    emitSocket(
      `update${this.identifier}`,
      this.timer.getTimeRemaining(),
      this.timer.isPaused()
    );
  }
}

module.exports = Controller;
