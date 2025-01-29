const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const createEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Displays information about the DISCORDJS Bot Template.'),
  async execute(interaction) {
    await interaction.deferReply();

    const embedOptions = {
      description: `A versatile Discord bot template built with Discord.js. Perfect for developers who want a quick start with customizable commands, event handling, and essential features to kick off a new Discord bot project. Get ready to enhance your server with ease!`,
      footerText: 'Made with ❤️ by n0sk1ll',
      timestamp: false,
    };

    const adButton = new ButtonBuilder()
      .setLabel('Github')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://github.com/NoSkill33`);
    const row = new ActionRowBuilder().addComponents(adButton);

    const embed = createEmbed.createEmbed(embedOptions);

    await interaction.editReply({ embeds: [embed], components: [row] });
  },
};
