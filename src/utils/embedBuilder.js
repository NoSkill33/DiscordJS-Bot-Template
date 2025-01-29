const { EmbedBuilder } = require('discord.js');
const config = require('../../config/config.json');

function createEmbed({
  fields = [],
  titleText = '',
  description = null, // default
  color = config.bot_color,
  authorName = null, // default
  authorIconURL = null, // default
  thumbnailURL = null, // default
  imageURL = null, // default
  footerText = null, // default
  footerIconURL = null, // default
  url = null, // default
  timestamp = true,
}) {
  // init
  const embed = new EmbedBuilder().setColor(color);

  //@optional: set title if provided
  if (titleText) {
    embed.setTitle(titleText);
  }

  //@optional: Set description if provided and non-empty
  if (description) {
    embed.setDescription(description);
  }

  //@optional: set author if authorName is provided
  if (authorName) {
    embed.setAuthor({
      name: authorName,
      iconURL: authorIconURL || config.bot_logo, // fallback to bot logo if authorIconURL is not provided
    });
  }

  //@optional: set thumbnail if provided
  if (thumbnailURL) {
    embed.setThumbnail(thumbnailURL);
  }

  //@optional: set image if provided
  if (imageURL) {
    embed.setImage(imageURL);
  }

  //@optional: set URL if provided
  if (url) {
    embed.setURL(url);
  }

  //@optional: set footer if provided
  if (footerText || footerIconURL) {
    embed.setFooter({
      text: footerText || '', // use empty string if footerText is not provided
      iconURL: footerIconURL || null, // ues null if footerIconURL is not provided
    });
  }

  //@optional: add fields if provided
  if (fields.length > 0) {
    embed.addFields(fields);
  }

  //@optional: set timestamp if the `timestamp` argument is true
  if (timestamp) {
    embed.setTimestamp(new Date());
  }

  return embed;
}

module.exports = { createEmbed };
