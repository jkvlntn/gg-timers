const { SlashCommandBuilder } = require("discord.js");

class Command {
  constructor(name, description) {
    this.data = new SlashCommandBuilder();
    this.data.setName(name);
    this.data.setDescription(description);
  }
  async run() {}
}

module.exports = Command;
