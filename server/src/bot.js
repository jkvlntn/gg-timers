const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const commandsExports = require("./commands");
const { getTimerEmbed, getButtonController } = require("./gui");
require("dotenv").config();

class Bot {
  constructor(controller, token, id, defaultChannelId, allowCommands) {
    this.controller = controller;
    this.controller.registerBot(this);
    this.token = token;
    this.id = id;
    this.defaultChannelId = defaultChannelId;
    this.defaultChannel = null;
    this.loggingChannelId = process.env.LOGGING_CHANNEL_ID;
    this.loggingChannel = null;
    this.allowCommands = allowCommands;
    this.voiceConnection = null;
    this.audioPlayer = createAudioPlayer();

    this.timerEmbed = getTimerEmbed(this.controller.getIdentifier());
    this.timerEmbedMessage = null;

    this.buttons = getButtonController();

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
      ],
    });

    this.rest = new REST().setToken(this.token);

    this.client.once(Events.ClientReady, (readyClient) => {
      console.log(`${readyClient.user.tag} has been logged in!`);
      this.removeOldMessages();
      this.registerCommands();
    });

    this.client.on(Events.InteractionCreate, (interaction) => {
      let command;
      if (interaction.isChatInputCommand()) {
        command = interaction.commandName;
      } else if (interaction.isButton()) {
        command = interaction.customId;
      } else {
        return;
      }
      switch (command) {
        case "start":
          this.startCommand(interaction);
          break;
        case "pause":
          this.pauseCommand(interaction);
          break;
        case "reset":
          this.resetCommand(interaction);
          break;
        case "set":
          this.setCommand(interaction);
          break;
        case "join":
          this.joinCommand(interaction);
          break;
        case "leave":
          this.leaveCommand(interaction);
          break;
        default:
          interaction.reply({ content: `Unknown command`, ephemeral: true });
      }
    });

    this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      if (this.client.user.id !== newState.id) {
        return;
      }
      if (newState.channelId === null) {
        this.disconnectFromVoice();
      }
    });

    this.client.login(this.token).catch((error) => {
      console.log(error);
    });
  }

  startCommand(interaction) {
    this.reply(
      interaction,
      `Starting timer: Server ${this.controller.getIdentifier()}`
    );
    this.controller.start();
    this.log(
      `${
        interaction.member.nickname || interaction.user.globalName
      } started timer on server ${this.controller.getIdentifier()}`
    );
  }

  pauseCommand(interaction) {
    this.reply(
      interaction,
      `Pausing timer: Server ${this.controller.getIdentifier()}`
    );
    this.controller.pause();
    this.log(
      `${
        interaction.member.nickname || interaction.user.globalName
      } paused timer on server ${this.controller.getIdentifier()}`
    );
  }

  resetCommand(interaction) {
    this.reply(
      interaction,
      `Resetting timer: Server ${this.controller.getIdentifier()}`
    );
    this.controller.reset();
    this.log(
      `${
        interaction.member.nickname || interaction.user.globalName
      } reset timer on server ${this.controller.getIdentifier()}`
    );
  }

  setCommand(interaction) {
    this.reply(
      interaction,
      `Setting timer: Server ${this.controller.getIdentifier()}`
    );
    const minutes = interaction.options.getInteger("minutes");
    const seconds = interaction.options.getInteger("seconds");
    this.controller.set(minutes * 60 + seconds);
    this.log(
      `${
        interaction.member.nickname || interaction.user.globalName
      } set timer on server ${this.controller.getIdentifier()}`
    );
  }

  async joinCommand(interaction) {
    this.reply(
      interaction,
      `Preparing bots for Server ${this.controller.getIdentifier()}`
    );
    this.log(
      `${
        interaction.member.nickname || interaction.user.globalName
      } initialized server ${this.controller.getIdentifier()} bots`
    );
    await this.controller.initializeAll();
  }

  async leaveCommand(interaction) {
    await this.reply(
      interaction,
      `Disconnecting bots for Server ${this.controller.getIdentifier()}`
    );
    this.log(
      `${
        interaction.member.nickname || interaction.user.globalName
      } disconnected server ${this.controller.getIdentifier()} bots`
    );
    await this.controller.clearAll();
  }

  async initialize() {
    const channel = await this.getDefaultChannel();
    if (!channel) {
      return;
    }
    await this.sendEmbed(channel);
    this.connectToVoice(channel);
  }

  async clear() {
    await this.deleteCurrentEmbed();
    this.disconnectFromVoice();
  }

  async updateEmbed() {
    if (!this.timerEmbedMessage) {
      return;
    }
    this.setEmbedToCurrentTime();
    try {
      if (this.allowCommands) {
        await this.timerEmbedMessage.edit({
          embeds: [this.timerEmbed],
          components: [this.buttons],
        });
      } else {
        await this.timerEmbedMessage.edit({
          embeds: [this.timerEmbed],
        });
      }
    } catch (error) {
      console.log("Could not edit embedding (was it deleted?)");
      this.timerEmbedMessage = null;
    }
  }

  playAudio(audioFile) {
    if (!this.voiceConnection) {
      return;
    }
    try {
      const resource = createAudioResource(audioFile);
      this.audioPlayer.play(resource);
    } catch (error) {
      console.log("Could not play audio (was bot disconnected?)");
      this.voiceConnection = null;
    }
  }

  setEmbedToCurrentTime() {
    this.timerEmbed.setTitle(
      `Timer - Server ${this.controller.getIdentifier()}`
    );
    this.timerEmbed.setDescription(
      `Time Remaining: ${this.controller.getTimeString()}`
    );
  }

  async deleteCurrentEmbed() {
    if (!this.timerEmbedMessage) {
      return;
    }
    try {
      await this.timerEmbedMessage.delete();
      this.timerEmbedMessage = null;
    } catch (error) {
      this.timerEmbedMessage = null;
    }
  }

  async sendEmbed(channel) {
    await this.deleteCurrentEmbed();
    this.setEmbedToCurrentTime();
    try {
      if (this.allowCommands) {
        this.timerEmbedMessage = await channel.send({
          embeds: [this.timerEmbed],
          components: [this.buttons],
        });
      } else {
        this.timerEmbedMessage = await channel.send({
          embeds: [this.timerEmbed],
        });
      }
    } catch (error) {
      this.timerEmbedMessage = null;
      console.log("Failed to send embed");
    }
  }

  async reply(interaction, message) {
    try {
      await interaction.reply({ content: message, ephemeral: true });
    } catch (error) {
      console.log("Failed to reply to interaction");
    }
  }

  connectToVoice(channel) {
    try {
      this.voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        group: this.client.user.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      this.voiceConnection.subscribe(this.audioPlayer);
    } catch (error) {
      this.voiceConnection = null;
      console.log("Failed to connect to voice channel");
    }
  }

  disconnectFromVoice() {
    if (!this.voiceConnection) {
      return;
    }
    this.voiceConnection.destroy();
    this.voiceConnection = null;
  }

  async getDefaultChannel() {
    if (this.defaultChannel) {
      return this.defaultChannel;
    }
    if (!this.defaultChannelId) {
      return null;
    }
    try {
      this.defaultChannel = await this.client.channels.fetch(
        this.defaultChannelId
      );
      return this.defaultChannel;
    } catch (error) {
      console.log("Channel could not be found based on provided id");
      return null;
    }
  }

  async getLoggingChannel() {
    if (this.loggingChannel) {
      return this.loggingChannel;
    }
    if (!this.loggingChannelId) {
      return null;
    }
    try {
      this.loggingChannel = await this.client.channels.fetch(
        this.loggingChannelId
      );
      return this.loggingChannel;
    } catch (error) {
      console.log("Logging channel could not be found based on provided id");
      return null;
    }
  }

  async log(message) {
    const channel = await this.getLoggingChannel();
    if (!channel) {
      return;
    }
    try {
      await channel.send({ content: message });
    } catch (error) {
      console.log("Could not send log message");
    }
  }

  async removeOldMessages() {
    const channel = await this.getDefaultChannel();
    if (!channel) {
      return;
    }
    try {
      let pastMessages = (await channel.messages.fetch({ limit: 100 })).filter(
        (message) => message.author.id === this.client.user.id
      );
      await Promise.all(pastMessages.map((message) => message.delete()));
    } catch (error) {
      console.log("Failed to clear past messages");
    }
  }

  registerCommands() {
    const exports = this.allowCommands ? commandsExports : [];
    this.rest
      .put(Routes.applicationCommands(this.id), {
        body: exports,
      })
      .catch((error) => {
        console.log("Failed to register commands");
      });
  }
}

module.exports = Bot;
