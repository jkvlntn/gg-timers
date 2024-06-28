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
const { emitSocket } = require("./socket");
const commandsExports = require("./commands");

class Bot {
  constructor(token, id, timer) {
    this.token = token;
    this.id = id;
    this.timer = timer;
    this.connection = null;
    this.audioPlayer = createAudioPlayer();

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
        default:
          interaction.reply("unknown command");
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
    this.timer.start(() => {
      emitSocket("update");
    });
    emitSocket("update");
  }

  async pauseCommand(interaction) {
    this.timer.pause();
    emitSocket("update");
    await interaction.reply({
      content: `Pausing timer: ${Math.floor(
        this.timer.getTimeRemaining() / 60
      )} minutes ${this.timer.getTimeRemaining() % 60} seconds remaining`,
      ephemeral: true,
    });
  }

  async resetCommand(interaction) {
    this.timer.reset();
    emitSocket("update");
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
    emitSocket("update");
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
      this.connection = joinVoiceChannel({
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
      console.log(error);
    }
  }

  startVoiceLine() {
    if (!this.connection) {
      return;
    }
    console.log("saying voice line");
    const resource = createAudioResource("./audio/start.mp3");
    this.audioPlayer.play(resource);
    this.connection.subscribe(this.audioPlayer);
  }

  pauseVoiceLine() {
    if (!this.connection) {
      return;
    }
    const resource = createAudioResource("./audio/pause.mp3");
    this.audioPlayer.play(resource);
    this.connection.subscribe(this.audioPlayer);
  }

  finishedVoiceLine() {
    if (!this.connection) {
      return;
    }
    const resource = createAudioResource("./audio/finished.mp3");
    this.audioPlayer.play(resource);
    this.connection.subscribe(this.audioPlayer);
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
