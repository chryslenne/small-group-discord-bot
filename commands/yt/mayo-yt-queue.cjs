const { SlashCommandBuilder } = require("discord.js");
const playerManager = require("../../player/PlayerManager.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-yt-queue")
    .setDescription("Show current queue"),

  async execute(interaction) {
    const player = playerManager.get(interaction.guildId);
    if (!player || (!player.current && player.queue.length === 0)) {
        return interaction.reply("📭 Queue is empty.");
    }

    let msg = "";

    if (player.current) {
        msg += `▶️ **Now Playing:** ${player.current.title}\n\n`;
    }

    if (player.queue.length > 0) {
        msg += "**📜 Up Next:**\n";
        const format = d => d ? `(${d})` : "";
        player.queue.forEach((t, i) => {
            msg += `${i + 1}. ${t.title} ${format(t.duration)}\n`;
        });

    }

    await interaction.reply(msg);
  }
};
