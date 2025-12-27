const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");
const { createStream } = require("./youtube.cjs");

class GuildPlayer {
  constructor(guildId, voiceChannelId) {
    this.guildId = guildId;
    this.voiceChannelId = voiceChannelId;
    this.connection = null;

    this.queue = [];
    this.current = null;

    this.audioPlayer = createAudioPlayer();

    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      this.playNext().catch(err => {
        console.error("Failed to play next track:", err);
        this.current = null;
      });
    });

    this.audioPlayer.on("error", error => {
      console.error("Audio player error:", error);
      this.playNext().catch(() => {});
    });
  }

  setConnection(connection) {
    this.connection = connection;
    this.connection.subscribe(this.audioPlayer);
  }

  async play(track) {
    if (!track?.url || typeof track.url !== "string") {
      throw new Error("Invalid track URL");
    }
    const stream = await createStream(track.url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    this.current = track;
    this.audioPlayer.play(resource);
  }

  async playNext() {
    if (this.queue.length === 0) {
      this.current = null;
      return;
    }

    const next = this.queue.shift();
    await this.play(next);
  }

  stop() {
    this.queue = [];
    this.audioPlayer.stop();
    this.current = null;
  }

  destroy() {
    this.stop();
    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }
  }
}

module.exports = GuildPlayer;
