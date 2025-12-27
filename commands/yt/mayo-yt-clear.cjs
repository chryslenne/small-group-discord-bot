const { SlashCommandBuilder } = require("discord.js");
const playerManager = require("../../player/PlayerManager.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-yt-clear")
    .setDescription("Clear the queue"),

  async execute(interaction) {
    const player = playerManager.get(interaction.guildId);
    if (!player) return interaction.reply("❌ No active player.");

    player.clearQueue();
    await interaction.reply("🧹 Queue cleared.");
  }
};
