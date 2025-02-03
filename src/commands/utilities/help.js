const { SlashCommandBuilder } = require('discord.js');
const createEmbed = require('../../utils/embedBuilder');

//@note: Simple list of commands that automatically update.

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Replies with list of all commands and descriptions!'),

  async execute(interaction) {
    const commands = interaction.client.commands;
    const commandList = commands
      .map((cmd) => `\`/${cmd.data.name}\``) //@note: if you'd like to you can display descriptions using "cmd.data.description"
      .join(', ');

    embedOptions = {
      titleText: 'List of commands',
      description: commandList,
    };

    const embed = createEmbed.createEmbed(embedOptions);
    await interaction.reply({ embeds: [embed] });
  },
};
