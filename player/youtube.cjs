const playdl = require("play-dl");

/**
 * Resolves a YouTube query into playable track metadata
 * @param {string} query
 * @returns {Promise<Array<{title, url, duration, thumbnail}>>}
 */
async function resolveYouTube(query) {
  // Direct video URL
  if (playdl.yt_validate(query) === "video") {
    const info = await playdl.video_basic_info(query);
    return [{
      title: info.video_details.title,
      url: info.video_details.url,
      duration: info.video_details.durationInSec,
      thumbnail: info.video_details.thumbnails.at(-1)?.url
    }];
  }

  // Playlist URL
  if (playdl.yt_validate(query) === "playlist") {
    const playlist = await playdl.playlist_info(query, { incomplete: true });
    const videos = await playlist.all_videos();

    return videos
      .filter(v => typeof v.url === "string")
      .map(v => ({
        title: v.title,
        url: v.url,
        duration: v.durationInSec,
        thumbnail: v.thumbnails.at(-1)?.url
      }));
  }

  // Search query
  const results = await playdl.search(query, { limit: 1 });
  if (!results.length) return [];

  const video = results[0];
  return [{
    title: video.title,
    url: video.url,
    duration: video.durationInSec,
    thumbnail: video.thumbnails.at(-1)?.url
  }];
}

/**
 * Creates an audio stream for @discordjs/voice
 * @param {string} url
 */
async function createStream(url) {
  if (!url || typeof url !== "string") {
    throw new Error(`createStream() called with invalid URL: ${url}`);
  }

  const info = await playdl.video_info(url);
  const stream = await playdl.stream_from_info(info);
  return {
    stream: stream.stream,
    type: stream.type
  };
}

module.exports = {
  resolveYouTube,
  createStream
};
