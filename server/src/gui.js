const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
require("dotenv").config();

const getTimerEmbed = (identifier) => {
  return new EmbedBuilder().setURL(
    `${process.env.SERVER_URL}/server${identifier}`
  );
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

module.exports = { getTimerEmbed, getButtonController };
