const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const { emitSocket } = require("./socket");
const commandsExports = require("./commands");

class Bot {
  constructor(token, id, timer) {
    this.token = token;
    this.id = id;
    this.timer = timer;

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
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
    this.timer.start();
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

  startVoiceLine() {
    console.log("starting voice line");
  }

  pauseVoiceLine() {
    console.log("pausing voice line");
  }

  finishedVoiceLine() {
    console.log("finished voice line");
  }

  registerCommands() {
    console.log("Registering Commands");
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
