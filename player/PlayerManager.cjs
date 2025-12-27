const fs = require("fs");
const path = require("path");
const GuildPlayer = require("./GuildPlayer.cjs");

const STATE_FILE = path.join(__dirname, "../data/voice-state.json");

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return {};
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

const voiceState = loadState();

class PlayerManager {
  constructor() {
    this.players = new Map();
  }

  create(guildId, voiceChannelId) {
    const player = new GuildPlayer(guildId, voiceChannelId);
    this.players.set(guildId, player);

    voiceState[guildId] = { voiceChannelId };
    saveState(voiceState);

    return player;
  }

  get(guildId) {
    return this.players.get(guildId);
  }

  delete(guildId) {
    const player = this.players.get(guildId);
    if (player?.destroy) player.destroy();

    this.players.delete(guildId);
    delete voiceState[guildId];
    saveState(voiceState);
  }

  getSavedState() {
    return voiceState;
  }
}

module.exports = new PlayerManager();
