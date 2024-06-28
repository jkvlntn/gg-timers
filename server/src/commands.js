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
addCommandData("join", "Joins vc of sender");

const setCommand = new SlashCommandBuilder();
setCommand
  .setName("set")
  .setDescription("Sets the timer to a certain time")
  .addIntegerOption((option) => {
    return option
      .setName("minutes")
      .setDescription("minutes on timer")
      .setRequired(true);
  })
  .addIntegerOption((option) => {
    return option
      .setName("seconds")
      .setDescription("seconds on timer")
      .setRequired(true);
  });
commandsExports.push(setCommand);

module.exports = commandsExports;
