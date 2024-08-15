const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
require("dotenv").config();

const getTimerEmbed = (identifier) => {
  const embed = new EmbedBuilder();
  if (process.env.SERVER_URL) {
    embed.setURL(`${process.env.SERVER_URL}/server${identifier}`);
  }
  embed.setTitle(`Timer - Server ${identifier}`);
  return embed;
};

const getButtonController = () => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("start")
      .setLabel("Start")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("pause")
      .setLabel("Pause")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("end")
      .setLabel("End")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("reset")
      .setLabel("Reset")
      .setStyle(ButtonStyle.Danger)
  );
};

const getLoggingEmbed = (identifier, action, sender, picture) => {
  return new EmbedBuilder()
    .setTitle(action)
    .setDescription(`Server ${identifier}`)
    .setAuthor({ name: sender, iconURL: picture })
    .setTimestamp();
};

module.exports = { getTimerEmbed, getButtonController, getLoggingEmbed };
