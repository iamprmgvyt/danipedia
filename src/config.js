require("dotenv").config();

/**
 * Danipedia Configuration
 * Single source of truth for guild, category and authorized publishers.
 */
const CONFIG = {
  // Target guild — Danipedia only operates in this server.
  GUILD_ID: "1452708787646496792",

  // Only channels inside this category can be used for publishing.
  EVENT_CATEGORY_ID: "1453108985778540675",

  // Allowlist of users who can use /publish.
  AUTHORIZED_USERS: [
    "1262304052361035857",
    "1504395603268866079",
    "1152686909114556566",
    "1221925215983108116",
  ],

  // Image upload constraints.
  MAX_IMAGE_SIZE_BYTES: 25 * 1024 * 1024, // 25 MB
  SUPPORTED_IMAGE_TYPES: ["PNG", "JPEG", "WEBP", "GIF"],
  SUPPORTED_IMAGE_EXTENSIONS: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
  MAX_IMAGES: 3,

  // Discord credentials
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
};

module.exports = CONFIG;
