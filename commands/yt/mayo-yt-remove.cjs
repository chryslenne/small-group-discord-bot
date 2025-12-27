const { SlashCommandBuilder } = require("discord.js");
const playerManager = require("../../player/PlayerManager.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-yt-remove")
    .setDescription("Remove track from queue")
    .addIntegerOption(opt =>
      opt.setName("index")
        .setDescription("Queue index (1-based)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = playerManager.get(interaction.guildId);
    if (!player) return interaction.reply("❌ No active player.");

    const index = interaction.options.getInteger("index");
    const removed = player.remove(index);

    if (!removed) {
      return interaction.reply("❌ Invalid index.");
    }

    await interaction.reply(`🗑 Removed **${removed.title}**`);
  }
};
