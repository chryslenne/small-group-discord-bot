const { SlashCommandBuilder } = require("discord.js");
const playerManager = require("../../player/PlayerManager.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-yt-skip")
    .setDescription("Skip track(s)")
    .addIntegerOption(opt =>
      opt.setName("count")
        .setDescription("How many to skip")
        .setMinValue(1)
    ),

  async execute(interaction) {
    const player = playerManager.get(interaction.guildId);
    if (!player || !player.current) {
      return interaction.reply("❌ Nothing is playing.");
    }

    const count = interaction.options.getInteger("count") ?? 1;
    const skipped = player.skip(count);

    if (!player.current) {
      return interaction.reply("⏹ Playback stopped (queue empty).");
    }

    await interaction.reply(
      `⏭ Skipped **${skipped.title}**, now playing **${player.current.title}**`
    );
  }
};
