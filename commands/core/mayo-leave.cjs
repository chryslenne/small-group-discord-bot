const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const playerManager = require("../../player/PlayerManager.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-leave")
    .setDescription("Leave the voice channel"),

  async execute(interaction) {
    const player = playerManager.get(interaction.guildId);

    if (!player || !player.connection) {
      return interaction.reply({
        content: "❌ I'm not connected to a voice channel.",
        flags: MessageFlags.Ephemeral
      });
    }

    // Stop playback and destroy connection
    try {
      player.stop?.();
      player.connection.destroy();
    } catch (err) {
      console.warn("Error while leaving voice channel:", err);
    }

    playerManager.delete(interaction.guildId);

    await interaction.reply("👋 Left the voice channel.");
  }
};
