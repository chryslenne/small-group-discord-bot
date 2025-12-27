require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { joinVoiceChannel } = require("@discordjs/voice");
const playerManager = require("./player/PlayerManager.cjs");

const {
  Client,
  GatewayIntentBits,
  Collection,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
  .readdirSync(commandsPath, { recursive: true })
  .filter(file => file.endsWith(".cjs"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (!command?.data?.name || !command?.execute) continue;
  client.commands.set(command.data.name, command);
}

// Ready
client.once(Events.ClientReady, async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const saved = playerManager.getSavedState();

  for (const [guildId, data] of Object.entries(saved)) {
    try {
      const guild = await client.guilds.fetch(guildId);
      const channel = await guild.channels.fetch(data.voiceChannelId);

      if (!channel?.isVoiceBased() || !channel.joinable) continue;

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: true
      });

      const player = playerManager.create(guild.id, channel.id);
      player.setConnection(connection);

      console.log(`🔄 Reconnected to ${guild.name}`);
    } catch (err) {
      console.warn(`Failed to restore voice for guild ${guildId}`, err);
    }
  }
});

// Interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply("❌ An error occurred.");
    } else {
      await interaction.reply({
        content: "❌ An error occurred.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
