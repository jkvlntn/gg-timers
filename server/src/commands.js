const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const commandsExports = [];

const startCommand = new SlashCommandBuilder()
  .setName("start")
  .setDescription("Starts the timer")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers);
commandsExports.push(startCommand.toJSON());

const pauseCommand = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pauses the timer")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers);
commandsExports.push(pauseCommand.toJSON());

const resetCommand = new SlashCommandBuilder()
  .setName("reset")
  .setDescription("Resets the timer")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers);
commandsExports.push(resetCommand.toJSON());

const setCommand = new SlashCommandBuilder();
setCommand
  .setName("set")
  .setDescription("Sets the timer to a certain time")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
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
commandsExports.push(setCommand.toJSON());

const joinCommand = new SlashCommandBuilder()
  .setName("join")
  .setDescription("Join voice channel")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
  .addUserOption((option) => {
    return option
      .setName("user")
      .setDescription("user to join")
      .setRequired(false);
  });
commandsExports.push(joinCommand.toJSON());

const embedCommand = new SlashCommandBuilder()
  .setName("embed")
  .setDescription("Embeds the timer")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers);
commandsExports.push(embedCommand.toJSON());

module.exports = commandsExports;
