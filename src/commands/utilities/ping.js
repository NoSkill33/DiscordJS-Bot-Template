const { SlashCommandBuilder } = require('discord.js');

//@note: Simplest command you can do, if don't know where to start try to understand this code.
//@task: Try to make it actually display ping of the client

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Repiles with Pong!'),

  async execute(interaction) {
    return interaction.reply('Pong!');
  },
};
