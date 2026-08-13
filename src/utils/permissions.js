const CONFIG = require("../config");

/**
 * Check whether the interaction happened in the allowed guild.
 * @param {import('discord.js').Interaction} interaction
 * @returns {boolean}
 */
function isAllowedGuild(interaction) {
  return interaction.guildId === CONFIG.GUILD_ID;
}

/**
 * Check whether the user is in the authorized allowlist.
 * Authorization is strictly by Discord user ID.
 * @param {import('discord.js').Interaction} interaction
 * @returns {boolean}
 */
function isAuthorizedUser(interaction) {
  return CONFIG.AUTHORIZED_USERS.includes(interaction.user.id);
}

/**
 * Check whether the channel where the command is used belongs to the
 * designated event publishing category.
 * @param {import('discord.js').Interaction} interaction
 * @returns {boolean}
 */
function isEventChannel(interaction) {
  const channel = interaction.channel;
  if (!channel) return false;
  return channel.parentId === CONFIG.EVENT_CATEGORY_ID;
}

/**
 * Check whether the bot has the permissions required to publish
 * in the current channel.
 * @param {import('discord.js').Interaction} interaction
 * @returns {boolean}
 */
function hasPublishPermissions(interaction) {
  const channel = interaction.channel;
  if (!channel) return false;
  const me = interaction.guild?.members.me;
  if (!me) return false;

  return channel
    .permissionsFor(me)
    .has(["ViewChannel", "SendMessages", "EmbedLinks", "AttachFiles"]);
}

module.exports = {
  isAllowedGuild,
  isAuthorizedUser,
  isEventChannel,
  hasPublishPermissions,
};
