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
  constructor(token, id, timer) {
    this.token = token;
    this.id = id;
    this.timer = timer;
    this.timer.registerBot(this);
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
        case "embed":
          this.embedCommand(interaction);
          break;
        default:
          interaction.reply({ content: `Unknown command`, ephemeral: true });
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
      content: `Starting timer: ${Math.floor(
        this.timer.getTimeRemaining() / 60
      )} minutes ${this.timer.getTimeRemaining() % 60} seconds remaining`,
      ephemeral: true,
    });
    this.timer.start();
  }

  async pauseCommand(interaction) {
    this.timer.pause();
    await interaction.reply({
      content: `Pausing timer: ${Math.floor(
        this.timer.getTimeRemaining() / 60
      )} minutes ${this.timer.getTimeRemaining() % 60} seconds remaining`,
      ephemeral: true,
    });
  }

  async resetCommand(interaction) {
    this.timer.reset();
    await interaction.reply({
      content: `Resetting timer: ${Math.floor(
        this.timer.getTimeRemaining() / 60
      )} minutes ${this.timer.getTimeRemaining() % 60} seconds remaining`,
      ephemeral: true,
    });
  }

  async setCommand(interaction) {
    const minutes = interaction.options.getInteger("minutes");
    const seconds = interaction.options.getInteger("seconds");
    this.timer.set(minutes * 60 + seconds);
    await interaction.reply({
      content: `Resetting timer: ${Math.floor(
        this.timer.getTimeRemaining() / 60
      )} minutes ${this.timer.getTimeRemaining() % 60} seconds remaining`,
      ephemeral: true,
    });
  }

  async joinCommand(interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) {
      await interaction.reply({
        content: "You must be in a voice channel",
        ephemeral: true,
      });
      return;
    }
    try {
      this.voiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        group: this.client.user.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
      await interaction.reply({
        content: `Joining ${channel.name}`,
        ephemeral: true,
      });
    } catch (error) {
      console.log("Error joining voice channel");
      this.voiceConnection = null;
    }
  }

  async embedCommand(interaction) {
    interaction.reply({
      content: "Sending timer embed",
      ephemeral: true,
    });
    this.embed.setTitle("Timer");
    this.embed.setDescription(
      `Time Remaining: ${Math.floor(
        this.timer.getTimeRemaining() / 60
      )} minutes ${this.timer.getTimeRemaining() % 60} seconds`
    );
    this.embedMessage = await interaction.channel.send({
      embeds: [this.embed],
    });
  }

  startVoiceLine() {
    if (!this.voiceConnection) {
      return;
    }
    try {
      const resource = createAudioResource("./audio/start.mp3");
      this.audioPlayer.play(resource);
      this.voiceConnection.subscribe(this.audioPlayer);
    } catch (error) {
      console.log("Could not play audio (was bot disconnected?)");
      this.voiceConnection = null;
    }
  }

  pauseVoiceLine() {
    if (!this.voiceConnection) {
      return;
    }
    try {
      const resource = createAudioResource("./audio/pause.mp3");
      this.audioPlayer.play(resource);
      this.voiceConnection.subscribe(this.audioPlayer);
    } catch (error) {
      console.log("Could not play audio (was bot disconnected?)");
      this.voiceConnection = null;
    }
  }

  finishedVoiceLine() {
    if (!this.voiceConnection) {
      return;
    }
    try {
      const resource = createAudioResource("./audio/finished.mp3");
      this.audioPlayer.play(resource);
      this.voiceConnection.subscribe(this.audioPlayer);
    } catch (error) {
      console.log("Could not play audio (was bot disconnected?)");
      this.voiceConnection = null;
    }
  }

  async updateEmbed() {
    if (!this.embedMessage) {
      return;
    }
    try {
      this.embed.setDescription(
        `Time Remaining: ${Math.floor(
          this.timer.getTimeRemaining() / 60
        )} minutes ${this.timer.getTimeRemaining() % 60} seconds`
      );
      await this.embedMessage.edit({ embeds: [this.embed] });
    } catch (error) {
      console.log("Could not edit embedding (was it deleted?)");
      this.embedMessage = null;
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
