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
  constructor(controller, token, id, defaultChannelId) {
    this.controller = controller;
    this.controller.registerBot(this);
    this.token = token;
    this.id = id;
    this.defaultChannelId = defaultChannelId;
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
        case "initialize":
          this.initializeCommand(interaction);
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
        if (this.voiceConnection) {
          this.voiceConnection.destroy();
        }
        this.voiceConnection = null;
      }
    });

    this.registerClient();
    this.registerCommands();
  }

  registerClient() {
    this.client.login(this.token).catch((error) => {
      console.log(error);
    });
  }

  async startCommand(interaction) {
    await interaction.reply({
      content: `Starting timer: ${this.controller.getIdentifier()}`,
      ephemeral: true,
    });
    this.controller.start();
  }

  async pauseCommand(interaction) {
    this.controller.pause();
    await interaction.reply({
      content: `Pausing timer: ${this.controller.getIdentifier()}`,
      ephemeral: true,
    });
  }

  async resetCommand(interaction) {
    this.controller.reset();
    await interaction.reply({
      content: `Resetting timer: ${this.controller.getIdentifier()}`,
      ephemeral: true,
    });
  }

  async setCommand(interaction) {
    const minutes = interaction.options.getInteger("minutes");
    const seconds = interaction.options.getInteger("seconds");
    this.controller.set(minutes * 60 + seconds);
    await interaction.reply({
      content: `Setting timer: ${this.controller.getIdentifier()}`,
      ephemeral: true,
    });
  }

  async joinCommand(interaction) {
    let channel;
    const user = interaction.options.getUser("user");
    if (user) {
      const userToJoin = await interaction.guild.members.fetch(user.id);
      channel = userToJoin.voice.channel;
      if (!channel) {
        await interaction.reply({
          content: `${
            userToJoin.user.nickname || userToJoin.user.globalName
          } is not in a voice channel`,
          ephemeral: true,
        });
        return;
      }
    } else {
      channel = interaction.member.voice.channel;
      if (!channel) {
        await interaction.reply({
          content: "You must be in a voice channel",
          ephemeral: true,
        });
        return;
      }
    }
    try {
      this.voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        group: this.client.user.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
      this.voiceConnection.subscribe(this.audioPlayer);
      await interaction.reply({
        content: `Joining ${channel.name}`,
        ephemeral: true,
      });
    } catch (error) {
      console.log("Error joining voice channel");
      this.voiceConnection = null;
    }
  }

  async initializeCommand(interaction) {
    await interaction.reply({
      content: `Initializing bots for ${this.controller.getIdentifier()}`,
      ephemeral: true,
    });
    this.controller.initializeAll();
  }

  async initialize() {
    const channel = await this.client.channels.fetch(this.defaultChannelId);
    this.setEmbedToCurrentTime();
    this.embedMessage = await channel.send({
      embeds: [this.embed],
    });
    this.voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      group: this.client.user.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
  }

  setEmbedToCurrentTime() {
    this.embed.setTitle(`Timer - ${this.controller.getIdentifier()}`);
    this.embed.setDescription(
      `Time Remaining: ${this.controller.getTimeString()}`
    );
  }

  async embedCommand(interaction) {
    interaction.reply({
      content: "Sending timer embed",
      ephemeral: true,
    });
    this.setEmbedToCurrentTime();
    this.embedMessage = await interaction.channel.send({
      embeds: [this.embed],
    });
  }

  async updateEmbed() {
    if (!this.embedMessage) {
      return;
    }
    try {
      this.setEmbedToCurrentTime();
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

  registerCommands() {
    this.rest
      .put(Routes.applicationCommands(this.id), {
        body: commandsExports,
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

module.exports = Bot;
