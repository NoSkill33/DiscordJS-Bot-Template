const { SlashCommandBuilder, version } = require('discord.js');
const os = require('os');
const { execSync } = require('child_process');
const createEmbed = require('../../utils/embedBuilder');
const packageInfo = require('../../../package.json');
const si = require('systeminformation');

const getNodeInfo = () => {
  return execSync('node -v').toString().trim();
};

// uptime function
const formatUptime = (uptime) => {
  const days = Math.floor(uptime / (24 * 60 * 60));
  const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// ram function
function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usedMemMB = usedMem / (1024 * 1024);
  const usedMemPercent = (usedMem / totalMem) * 100;
  return { usedMemMB, usedMemPercent };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription(`Display's Bot Status`),
  developer: true,
  async execute(interaction) {
    const client = interaction.client;
    const totalUsers = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0,
    );

    await interaction.deferReply();

    const embedOptions = {
      fields: [
        {
          name: '**Host status**',
          value:
            `\`\`\`\n` +
            `• OS: ${os.type()} ${os.release()} (${os.arch()})\n` +
            `• CPU: ${(await si.cpu()).manufacturer || 'N/A'} ${(await si.cpu()).brand}\n` +
            `• Uptime: ${formatUptime(os.uptime())}\n` +
            `• Avaiable Memory: ${(os.totalmem() / (1024 * 1024)).toFixed(2)}MB\n` +
            `• Memory Usage: ${getMemoryUsage().usedMemMB.toFixed(
              2,
            )}MB (${getMemoryUsage().usedMemPercent.toFixed(2)}%)\n` +
            `• Node.js: ${getNodeInfo()}\n\`\`\``,
          inline: false,
        },
        {
          name: '**Bot info**',
          value:
            `\`\`\`\n` +
            `• Bot Version: ${packageInfo.version}\n` +
            `• Discord.js Version: ${version}\n` +
            `• Client Ping: ${(await interaction.fetchReply()).createdTimestamp - interaction.createdTimestamp}ms\n` +
            `• Guild Count: ${client.guilds.cache.size}\n` +
            `• User Count: ${totalUsers}\n` +
            `• Channel Count: ${client.channels.cache.size}\n\`\`\``,
          inline: false,
        },
      ],
      titleText: 'Status',
    };

    const embed = createEmbed.createEmbed(embedOptions);

    await interaction.editReply({ embeds: [embed] });
  },
};
