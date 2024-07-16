const Timer = require("./timer");
const { addSocketHandler, emitSocket } = require("./socket");
const { BitField } = require("discord.js");

class Controller {
  constructor(identifier) {
    this.identifier = identifier;
    this.timer = new Timer(900, this.updateEmbeds.bind(this), () => {
      this.playAudio("./audio/finished.mp3");
      this.emitTime();
    });
    this.bots = [];
    addSocketHandler(`get${identifier}`, this.emitTime.bind(this));
    this.sync = 0;
  }
  registerBot(bot) {
    this.bots.push(bot);
  }
  async start() {
    const sync = this.eventSync();
    await this.playBlockingAudio("./audio/start.mp3");
    if (this.validateSync(sync)) {
      this.timer.start();
      this.emitTime();
    }
  }
  pause() {
    this.eventSync();
    this.timer.pause();
    this.emitTime();
    this.playAudio("./audio/pause.mp3");
  }
  end() {
    this.eventSync();
    this.timer.pause();
    this.emitTime();
    this.playAudio("./audio/finished.mp3");
  }
  reset() {
    this.eventSync();
    this.timer.reset();
    this.updateEmbeds();
    this.emitTime();
  }
  set(timeToSet) {
    this.eventSync();
    this.timer.set(timeToSet);
    this.updateEmbeds();
    this.emitTime();
  }
  initializeAll() {
    this.bots.map((bot) => bot.initialize());
  }
  clearAll() {
    this.bots.map((bot) => bot.clear());
  }
  getIdentifier() {
    return this.identifier;
  }
  eventSync() {
    this.sync += 1;
    return this.sync;
  }
  validateSync(sync) {
    return this.sync === sync;
  }
  playAudio(audioFile) {
    this.bots.map((bot) => bot.playAudio(audioFile));
  }
  async playBlockingAudio(audioFile) {
    await Promise.all(this.bots.map((bot) => bot.playBlockingAudio(audioFile)));
  }
  updateEmbeds() {
    this.bots.map((bot) => {
      bot.updateEmbed();
    });
  }
  getTimeString() {
    return `${this.timer.getMinutesRemaining()} minutes ${this.timer.getSecondsRemaining()} seconds`;
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
