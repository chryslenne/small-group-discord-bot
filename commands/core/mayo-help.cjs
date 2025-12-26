const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-help")
    .setDescription("Show Mayo bot commands"),

  async execute(interaction) {
    await interaction.reply({
      ephemeral: true,
      content:
        "**🥪 Mayo Bot Commands**\n" +
        "/mayo-join\n" +
        "/mayo-leave\n" +
        "/mayo-help\n\n" +
        "**🎵 YouTube**\n" +
        "/mayo-yt-play\n" +
        "/mayo-yt-skip\n" +
        "/mayo-yt-stop\n" +
        "/mayo-yt-queue\n" +
        "/mayo-yt-insert\n" +
        "/mayo-yt-remove\n" +
        "/mayo-yt-clear"
    });
  }
};
