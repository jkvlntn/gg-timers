const Command = require("./command");
const timer = require("../timer");
const { emitSocket } = require("../socket");

class StartCommand extends Command {
  constructor() {
    super("start", "Starts the timer");
  }
  async run(interaction) {
    await interaction.reply({
      content: `Starting timer: ${Math.floor(
        timer.getTimeRemaining() / 60
      )} minutes ${timer.getTimeRemaining() % 60} seconds remaining`,
      ephemeral: true,
    });
    timer.start();
    emitSocket("update");
  }
}

module.exports = new StartCommand();
