const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const playerManager = require("../../player/PlayerManager.cjs");
const Track = require("../../player/Track.cjs");
const { resolveYouTube } = require("../../player/youtube.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-yt-play")
    .setDescription("Play a YouTube video or playlist")
    .addStringOption(option =>
      option
        .setName("query")
        .setDescription("YouTube link or search query")
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = playerManager.get(interaction.guildId);

    if (!player) {
      return interaction.reply({
        content: "❌ Bot is not connected. Use `/mayo-join` first.",
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferReply();

    const query = interaction.options.getString("query");

    let rawTracks;
    try {
      rawTracks = await resolveYouTube(query);
    } catch (err) {
      console.error("YouTube resolve failed:", err);
      return interaction.editReply("❌ Failed to resolve YouTube query.");
    }

    if (!rawTracks || rawTracks.length === 0) {
      return interaction.editReply("❌ No results found.");
    }
    // Convert resolved results into Track objects
    const tracks = rawTracks.map(t => {
      if (!t.url || typeof t.url !== "string") {
        throw new Error(`Resolved track missing URL: ${t.title}`);
      }

      return new Track({
        title: t.title,
        url: t.url,
        duration: t.duration,
        thumbnail: t.thumbnail,
        requestedBy: interaction.user.username
      });
    });

    // If nothing is playing, start immediately
    if (!player.current) {
      const first = tracks.shift();
      try {
        await player.play(first);
      } catch (err) {
        console.error("Playback failed:", err);
        return interaction.editReply("❌ Failed to start playback.");
      }
    }

    // Queue remaining tracks
    if (tracks.length > 0) {
      player.queue.push(...tracks);
    }

    // Build response message
    if (player.current && rawTracks.length > 1) {
      return interaction.editReply(
        `▶️ Now playing **${player.current.title}**\n📂 Queued **${rawTracks.length - 1}** more track(s).`
      );
    }

    if (player.current) {
      return interaction.editReply(
        `➕ Queued **${tracks.length || 1}** track(s).`
      );
    }

    return interaction.editReply("▶️ Playback started.");
  }
};
