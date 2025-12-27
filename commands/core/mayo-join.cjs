const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const playerManager = require("../../player/PlayerManager.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mayo-join")
    .setDescription("Join your current voice channel"),

  async execute(interaction) {
    const voiceChannel = interaction.member.voice?.channel;

    // 1️⃣ Validate user is in a voice channel
    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You must be in a voice channel.",
        flags: MessageFlags.Ephemeral
      });
    }

    // 2️⃣ Prevent duplicate connections
    const existing = getVoiceConnection(interaction.guildId);
    if (existing) {
      return interaction.reply({
        content: "⚠️ I am already connected to a voice channel.",
        flags: MessageFlags.Ephemeral
      });
    }

    // 3️⃣ Join voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: true
    });

    // 4️⃣ Create player with connection
    playerManager.create(
      interaction.guildId,
      voiceChannel.id,
      connection
    );

    await interaction.reply(`🥪 Joined **${voiceChannel.name}**`);
  }
};
