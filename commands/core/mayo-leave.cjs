const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-leave")
    .setDescription("Leave the voice channel"),

  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guildId);

    if (!connection) {
      return interaction.reply({
        content: "❌ I'm not connected to a voice channel.",
        ephemeral: true
      });
    }

    connection.destroy();
    await interaction.reply("👋 Left the voice channel.");
  }
};
