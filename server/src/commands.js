const { SlashCommandBuilder } = require("discord.js");

const commandsExports = [];

const addCommandData = (name, description) => {
  const commandData = new SlashCommandBuilder();
  commandData.setName(name);
  commandData.setDescription(description);
  commandsExports.push(commandData.toJSON());
};

addCommandData("start", "Starts the timer");
addCommandData("pause", "Pauses the timer");
addCommandData("reset", "Resets the timer");

module.exports = commandsExports;
