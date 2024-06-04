const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const pingCommand = require("./commands/ping");

class Bot {
  static availableCommands = {
    [pingCommand.data.name]: pingCommand,
  };
  static availableCommandsExport = [pingCommand.data.toJSON()];

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
      console.log("running a command");
      const commandToRun = Bot.availableCommands[interaction.commandName];
      if (!commandToRun) {
        interaction.reply("unknown command");
        return;
      }
      commandToRun.run(interaction);
    });

    this.client.on(Events.MessageCreate, (interaction) => {
      console.log(interaction.content);
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
      .catch("Could not Register Commands");
  }
}

module.exports = Bot;
