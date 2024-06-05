const Command = require("./command");
const timer = require("../timer");
const { emitSocket } = require("../socket");

class ResetCommand extends Command {
  constructor() {
    super("reset", "Resets the timer");
  }
  async run(interaction) {
    timer.reset();
    emitSocket("update");
    await interaction.reply({
      content: `Resetting timer: ${Math.floor(
        timer.getTimeRemaining() / 60
      )} minutes ${timer.getTimeRemaining() % 60} seconds remaining`,
      ephemeral: true,
    });
  }
}

module.exports = new ResetCommand();
