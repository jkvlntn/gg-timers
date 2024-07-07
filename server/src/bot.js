const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  EmbedBuilder,
} = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const commandsExports = require("./commands");

class Bot {
  constructor(controller, token, id, defaultChannelId, allowCommands) {
    this.controller = controller;
    this.controller.registerBot(this);
    this.token = token;
    this.id = id;
    this.defaultChannelId = defaultChannelId;
    this.allowCommands = allowCommands;
    this.voiceConnection = null;
    this.audioPlayer = createAudioPlayer();
    this.embed = new EmbedBuilder();
    this.embedMessage = null;

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
      const command = interaction.commandName;
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
        case "embed":
          this.embedCommand(interaction);
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

  async startCommand(interaction) {
    await this.reply(
      interaction,
      `Starting timer: Server ${this.controller.getIdentifier()}`
    );
    this.controller.start();
  }

  async pauseCommand(interaction) {
    await this.reply(
      interaction,
      `Pausing timer: Server ${this.controller.getIdentifier()}`
    );
    this.controller.pause();
  }

  async resetCommand(interaction) {
    await this.reply(
      interaction,
      `Resetting timer: Server ${this.controller.getIdentifier()}`
    );
    this.controller.reset();
  }

  async setCommand(interaction) {
    await this.reply(
      interaction,
      `Setting timer: Server ${this.controller.getIdentifier()}`
    );
    const minutes = interaction.options.getInteger("minutes");
    const seconds = interaction.options.getInteger("seconds");
    this.controller.set(minutes * 60 + seconds);
  }

  async joinCommand(interaction) {
    await this.reply(
      interaction,
      `Preparing bots for Server ${this.controller.getIdentifier()}`
    );
    await this.controller.initializeAll();
  }

  async leaveCommand(interaction) {
    await this.reply(
      interaction,
      `Disconnecting bots for Server ${this.controller.getIdentifier()}`
    );
    await this.controller.clearAll();
  }

  async initialize() {
    const channel = await this.getDefaultChannelFromId(this.defaultChannelId);
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
    if (!this.embedMessage) {
      return;
    }
    this.setEmbedToCurrentTime();
    try {
      await this.embedMessage.edit({ embeds: [this.embed] });
    } catch (error) {
      console.log("Could not edit embedding (was it deleted?)");
      this.embedMessage = null;
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
    this.embed.setTitle(`Timer - Server ${this.controller.getIdentifier()}`);
    this.embed.setDescription(
      `Time Remaining: ${this.controller.getTimeString()}`
    );
  }

  async deleteCurrentEmbed() {
    if (!this.embedMessage) {
      return;
    }
    try {
      await this.embedMessage.delete();
      this.embedMessage = null;
    } catch (error) {
      this.embedMessage = null;
    }
  }

  async sendEmbed(channel) {
    await this.deleteCurrentEmbed();
    this.setEmbedToCurrentTime();
    try {
      this.embedMessage = await channel.send({
        embeds: [this.embed],
      });
    } catch (error) {
      this.embedMessage = null;
      console.log("Failed to send embed");
    }
  }

  async reply(interaction, message) {
    await interaction.reply({ content: message, ephemeral: true });
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

  async getDefaultChannelFromId() {
    if (!this.defaultChannelId) {
      return null;
    }
    try {
      const channel = await this.client.channels.fetch(this.defaultChannelId);
      return channel;
    } catch (error) {
      console.log("Channel could not be found based on provided id");
      return null;
    }
  }

  async removeOldMessages() {
    const channel = await this.getDefaultChannelFromId();
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
        console.log(error);
      });
  }
}

module.exports = Bot;
