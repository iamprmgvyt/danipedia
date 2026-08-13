const CONFIG = require("../config");

/**
 * Validate a single image attachment.
 * Returns an object describing whether the attachment is valid
 * and, if not, which error message to show.
 *
 * @param {import('discord.js').Attachment} attachment
 * @returns {{ valid: boolean, error?: string }}
 */
function validateImageAttachment(attachment) {
  if (!attachment) {
    return { valid: false, error: "Invalid image attachment." };
  }

  // Size check
  if (attachment.size > CONFIG.MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error:
        "One of the images is too large.\nMaximum image size is 25 MB.",
    };
  }

  // Determine the file extension (lower-cased for comparison)
  const lowerName = (attachment.name || "").toLowerCase();
  const hasValidExtension = CONFIG.SUPPORTED_IMAGE_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext),
  );

  // Determine the MIME type from contentType
  const contentType = (attachment.contentType || "").toUpperCase();
  const hasValidContentType = CONFIG.SUPPORTED_IMAGE_TYPES.some((type) =>
    contentType.includes(type),
  );

  // Accept if either extension OR contentType matches — this avoids
  // edge cases where Discord occasionally reports odd MIME types.
  if (!hasValidExtension && !hasValidContentType) {
    return {
      valid: false,
      error:
        "Invalid image attachment.\nSupported formats:\nPNG, JPG, JPEG, WEBP and GIF.",
    };
  }

  return { valid: true };
}

module.exports = {
  validateImageAttachment,
};
