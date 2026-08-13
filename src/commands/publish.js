const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");

const CONFIG = require("../config");
const {
  isAllowedGuild,
  isAuthorizedUser,
  isEventChannel,
  hasPublishPermissions,
} = require("../utils/permissions");
const { validateImageAttachment } = require("../utils/imageValidator");

const publishCommand = new SlashCommandBuilder()
  .setName("publish")
  .setDescription("Publish an event update.")
  .addStringOption((option) =>
    option
      .setName("content")
      .setDescription("Event information or description.")
      .setRequired(false),
  )
  .addAttachmentOption((option) =>
    option
      .setName("image")
      .setDescription("Event image.")
      .setRequired(false),
  )
  .addAttachmentOption((option) =>
    option
      .setName("image2")
      .setDescription("Additional event image.")
      .setRequired(false),
  )
  .addAttachmentOption((option) =>
    option
      .setName("image3")
      .setDescription("Additional event image.")
      .setRequired(false),
  );

/**
 * Build the clean Danipedia event embed.
 * Content is preserved verbatim — no rewriting, no summarizing.
 *
 * @param {string|null} content
 * @param {string|null} firstImageUrl
 * @returns {EmbedBuilder}
 */
function buildEventEmbed(content, firstImageUrl) {
  const embed = new EmbedBuilder().setColor(0x2b2d31);

  // Author header — "📖 Danipedia"
  embed.setAuthor({
    name: "📖 Danipedia",
  });

  // Content is preserved verbatim — no edits, no reformatting.
  if (content) {
    embed.setDescription(content);
  }

  // Primary image renders directly inside the embed.
  if (firstImageUrl) {
    embed.setImage(firstImageUrl);
  }

  // Footer
  embed.setFooter({
    text: "Danipedia • Event Archive",
  });

  // Timestamp for archival reference
  embed.setTimestamp();

  return embed;
}

/**
 * Execute the /publish command.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function execute(interaction) {
  // 1. Guild check
  if (!isAllowedGuild(interaction)) {
    return interaction.reply({
      content: "❌ Danipedia is not available in this server.",
      ephemeral: true,
    });
  }

  // 2. Authorized user check
  if (!isAuthorizedUser(interaction)) {
    return interaction.reply({
      content: "❌ You are not authorized to use this command.",
      ephemeral: true,
    });
  }

  // 3. Channel category check
  if (!isEventChannel(interaction)) {
    return interaction.reply({
      content: "❌ This channel is not an event publishing channel.",
      ephemeral: true,
    });
  }

  // 4. Permission check
  if (!hasPublishPermissions(interaction)) {
    return interaction.reply({
      content:
        "❌ I don't have the required permissions to publish in this channel.",
      ephemeral: true,
    });
  }

  // 5. Read content
  const content = interaction.options.getString("content");

  // 6. Read attachments
  const rawAttachments = [
    interaction.options.getAttachment("image"),
    interaction.options.getAttachment("image2"),
    interaction.options.getAttachment("image3"),
  ].filter(Boolean);

  // 7. At least content or one image is required
  if (!content && rawAttachments.length === 0) {
    return interaction.reply({
      content:
        "❌ Please provide event content or attach at least one image.",
      ephemeral: true,
    });
  }

  // 8. Validate every image attachment
  for (const attachment of rawAttachments) {
    const result = validateImageAttachment(attachment);
    if (!result.valid) {
      return interaction.reply({
        content: `❌ ${result.error}`,
        ephemeral: true,
      });
    }
  }

  try {
    // Build the primary embed — content verbatim + first image inline.
    const primaryEmbed = buildEventEmbed(
      content,
      rawAttachments[0]?.url || null,
    );

    const embeds = [primaryEmbed];

    // Additional images: each rendered as its own embed inside the same message.
    // This is the cleanest way to display multiple images in Discord.
    for (let i = 1; i < rawAttachments.length; i++) {
      const extraEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setImage(rawAttachments[i].url);
      embeds.push(extraEmbed);
    }

    // Send the event message publicly into the channel.
    await interaction.channel.send({ embeds });

    // Ephemeral success confirmation — does not clutter the event channel.
    return interaction.reply({
      content: "✅ Event published successfully.",
      ephemeral: true,
    });
  } catch (error) {
    // Never expose stack traces to users.
    console.error("[Danipedia] Publish error:", error);
    return interaction.reply({
      content:
        "❌ An unexpected error occurred while publishing the event. Please try again.",
      ephemeral: true,
    });
  }
}

module.exports = {
  data: publishCommand,
  execute,
};
