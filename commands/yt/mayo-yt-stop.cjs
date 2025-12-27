const { SlashCommandBuilder } = require("discord.js");
const playerManager = require("../../player/PlayerManager.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-yt-stop")
    .setDescription("Stop playback and clear the queue"),

  async execute(interaction) {
    const player = playerManager.get(interaction.guildId);

    if (!player) {
      return interaction.reply({
        content: "❌ No active player. Use /mayo-join first.",
        ephemeral: true
      });
    }

    if (!player.current && player.queue.length === 0) {
      return interaction.reply({
        content: "ℹ️ Nothing is playing.",
        ephemeral: true
      });
    }

    player.stop();

    await interaction.reply("⏹ Playback stopped and queue cleared.");
  }
};
