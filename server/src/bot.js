const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const pingCommand = require("./commands/ping");
const startCommand = require("./commands/start");
const pauseCommand = require("./commands/pause");
const resetCommand = require("./commands/reset");

class Bot {
  static availableCommands = {
    [pingCommand.data.name]: pingCommand,
    [startCommand.data.name]: startCommand,
    [pauseCommand.data.name]: pauseCommand,
    [resetCommand.data.name]: resetCommand,
  };
  static availableCommandsExport = [
    pingCommand.data.toJSON(),
    startCommand.data.toJSON(),
    pauseCommand.data.toJSON(),
    resetCommand.data.toJSON(),
  ];

  constructor(token, id) {
    this.token = token;
    this.id = id;

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
      const commandToRun = Bot.availableCommands[interaction.commandName];
      if (!commandToRun) {
        interaction.reply("unknown command");
        return;
      }
      commandToRun.run(interaction);
    });

    this.registerClient();
    this.registerCommands();
  }

  registerClient() {
    this.client.login(this.token).catch((error) => {
      console.log(error);
    });
  }

  registerCommands() {
    console.log("Registering Commands");
    this.rest
      .put(Routes.applicationCommands(this.id), {
        body: Bot.availableCommandsExport,
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

module.exports = Bot;
