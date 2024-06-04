const Command = require("./command");

class PingCommand extends Command {
  constructor() {
    super("ping", "replies with pong");
  }
  async run(interaction) {
    await interaction.reply("pong");
  }
}

module.exports = new PingCommand();
