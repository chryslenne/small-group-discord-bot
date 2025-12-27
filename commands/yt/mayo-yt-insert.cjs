// commands/yt/mayo-yt-insert.cjs
const { SlashCommandBuilder } = require("discord.js");
const playerManager = require("../../player/PlayerManager.cjs");
const Track = require("../../player/Track.cjs");
const { resolveYouTube } = require("../../player/youtube.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-yt-insert")
    .setDescription("Insert a track or playlist into the queue")
    .addStringOption(opt =>
      opt
        .setName("query")
        .setDescription("YouTube link or search query")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("index")
        .setDescription("Queue index (1-based). Default = next")
        .setMinValue(1)
    ),

  async execute(interaction) {
    const player = playerManager.get(interaction.guildId);

    if (!player) {
      return interaction.reply({
        content: "❌ No active player. Use /mayo-join first.",
        ephemeral: true
      });
    }

    // Defer because we may do network I/O (play-dl)
    await interaction.deferReply();

    const query = interaction.options.getString("query");
    const requestedIndex = interaction.options.getInteger("index"); // 1-based or null

    // Resolve YouTube (this returns { type, title?, tracks: [{title,url,duration,thumbnail,stream}] })
    let result;
    try {
      // resolveYouTube accepts (query, player) in the audio-enabled design
      result = await resolveYouTube(query, player);
    } catch (err) {
      console.error("YouTube resolve error:", err);
      return interaction.editReply("❌ Failed to resolve the query.");
    }

    if (!result || !result.tracks || result.tracks.length === 0) {
      return interaction.editReply("❌ No results found.");
    }

    // Build Track instances
    const tracks = result.tracks.map(t => new Track({
      title: t.title,
      url: t.url,
      duration: t.duration,
      thumbnail: t.thumbnail,
      requestedBy: interaction.user.username,
      stream: t.stream // stream function attached by resolver for playback
    }));

    // Determine insertion index in queue array (0-based)
    // Default insertion position = next (i.e., position 0 in the queue)
    // If index provided: index is 1-based into the *user-facing queue*, where 1 means first in queue (after current)
    // Implemented internal pos = index - 1
    const queueLen = player.queue.length;
    let insertPos;
    if (requestedIndex && Number.isInteger(requestedIndex)) {
      // convert requestedIndex to 0-based position in queue
      // valid requestedIndex range: 1 .. queueLen+1
      // clamp to [1, queueLen+1]
      const clamped = Math.min(Math.max(requestedIndex, 1), queueLen + 1);
      insertPos = clamped - 1;
    } else {
      insertPos = 0; // next
    }

    // If nothing is currently playing -> start first track immediately
    if (!player.current) {
      const first = tracks.shift(); // remove first from list
      // start playback for first
      if (first) {
        // If the track has an attached play function (audio enabled), call it.
        if (typeof first._play === "function") {
          try {
            first._play();
            player.current = first;
          } catch (err) {
            console.error("Failed to play inserted track:", err);
            // fallback: set as current but not playing
            player.current = first;
          }
        } else {
          // no audio function (shouldn't happen once audio wired), but set as current
          player.current = first;
        }
      }
      // Append remaining tracks to queue (at the front)
      for (let i = tracks.length - 1; i >= 0; i--) {
        // insert at position 0 so they become the next items
        player.queue.splice(0, 0, tracks[i]);
      }

      return interaction.editReply(`▶️ Started playing **${player.current.title}** and queued ${tracks.length} more track(s).`);
    }

    // Insert all tracks preserving order
    // We'll splice them into the array starting at insertPos, shifting subsequent items right.
    // To preserve order, iterate from first->last and increment insertion offset
    let insertedCount = 0;
    let pos = insertPos;
    for (const t of tracks) {
      // clamp pos (in case queue changed)
      const clampedPos = Math.min(Math.max(pos, 0), player.queue.length);
      player.queue.splice(clampedPos, 0, t);
      pos += 1;
      insertedCount += 1;
    }

    // Build friendly reply message
    if (result.type === "playlist") {
      return interaction.editReply(`📂 Inserted **${insertedCount}** tracks from playlist **${result.title}** at position ${insertPos + 1}.`);
    }

    return interaction.editReply(`➕ Inserted **${insertedCount}** track(s) at position ${insertPos + 1}.`);
  }
};
