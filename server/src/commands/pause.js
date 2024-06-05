const Command = require("./command");
const timer = require("../timer");
const { emitSocket } = require("../socket");

class PauseCommand extends Command {
  constructor() {
    super("pause", "Pauses the timer");
  }
  async run(interaction) {
    timer.pause();
    emitSocket("update");
    await interaction.reply({
      content: `Pausing timer: ${Math.floor(
        timer.getTimeRemaining() / 60
      )} minutes ${timer.getTimeRemaining() % 60} seconds remaining`,
      ephemeral: true,
    });
  }
}

module.exports = new PauseCommand();
