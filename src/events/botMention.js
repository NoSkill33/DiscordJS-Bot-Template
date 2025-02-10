const { Events } = require('discord.js');
const client = require('../../bootstrap');
const { getMention } = require('../utils/responseBuilder');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    const botMentioned = message.mentions.has(client.user);
    const botNameMentioned = message.content.includes(client.user.username);
    if (botMentioned || botNameMentioned) {
      //@note: you can add any logic here, even dedicated command handler.
      await message.reply(getMention());
    }
  },
};
