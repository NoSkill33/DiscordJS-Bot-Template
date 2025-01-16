const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config.json');
const { getcooldownMessages, getdeinMessages } = require('./responseBuilder');
const { createEmbed } = require('./embedBuilder');

async function loadCommands(client) {
  const commands = [];
  const commandPath = path.join(__dirname, '../commands');

  const readFilesRecursively = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readFilesRecursively(fullPath);
      } else if (file.endsWith('.js')) {
        const command = require(fullPath);
        if ('data' in command && 'execute' in command) {
          commands.push(command.data.toJSON());
          client.commands.set(command.data.name, command);
        } else {
          console.error(
            `Command file at ${file} is missing required properties.`,
          );
        }
      }
    }
  };

  readFilesRecursively(commandPath);

  //@note: register commands
  if (config.deploy_commands) {
    const rest = new REST().setToken(config.token);
    try {
      console.log('Started refreshing application commands.');
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
      console.log('Successfully reloaded application commands.');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }
}

async function synchronizeCommands(interaction, client) {
  //@note: sanity check
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    });
  }

  if (!interaction.inGuild()) {
    return interaction.reply({
      content: 'Komendy mogą zostać użyte tylko na serwerze.',
      ephemeral: true,
    });
  }

  const now = Date.now();
  const userId = interaction.user.id;
  const defaultCooldownDuration = 3;
  const globalCooldownAmount =
    (command.globalCooldown ?? defaultCooldownDuration) * 1_000;

  // developer only
  if (command.developer && !config.developerid.includes(userId)) {
    return interaction.reply({ content: getdeinMessages(), ephemeral: true });
  }

  // const comlogs_channel = client.channels.cache.get(config.comlogs_channel);

  // const embedOptions = {
  //   fields: [
  //     {
  //       name: 'Channel',
  //       value: `<#${interaction.channel.id}>`,
  //       inline: true,
  //     },
  //     {
  //       name: 'User',
  //       value: `<@${userId}> (${userId})`,
  //       inline: false,
  //     },
  //     {
  //       name: 'Command',
  //       value: `\`${interaction.commandName}\``,  // Nazwa komendy
  //       inline: false,
  //     },
  //   ],
  //   titleText: '**Command used**',
  //   //color: '#FF5733',
  //   //authorName: message.author.username,
  //   //authorIconURL: message.author.displayAvatarURL({ size: 4096 }),
  // };

  // // create embed
  // const embedlogs = createEmbed(embedOptions);

  // if (command.logs) {
  //   comlogs_channel.send({ embeds: [embedlogs] });
  // }

  //@note: server owner only command
  if (command.owner && interaction.user.id !== interaction.guild.ownerId) {
    return interaction.reply({
      content: 'This command is intended for the server owner only.',
      ephemeral: true,
    });
  }

  //@note: developer group cooldown bypass (uncomment to enable)
  // if (config.developerid.includes(userId)) {
  //   try {
  //     await command.execute(interaction);
  //   } catch (error) {
  //     console.error('Error executing command:', error);
  //   }
  //   return; // exit
  // }

  const globalCooldowns = client.globalCooldowns || new Collection();
  client.globalCooldowns = globalCooldowns;

  if (globalCooldowns.has(userId)) {
    const expirationTime = globalCooldowns.get(userId) + globalCooldownAmount;

    if (now < expirationTime) {
      const remainingTime = Math.ceil((expirationTime - now) / 1_000);
      return interaction.reply({
        content: getcooldownMessages().replace(
          '${remainingTime}',
          remainingTime,
        ),
        ephemeral: true,
      });
    }
  }

  //@note: update global cooldowns table
  globalCooldowns.set(userId, now);
  setTimeout(() => globalCooldowns.delete(userId), globalCooldownAmount);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
  }
}

module.exports = { loadCommands, synchronizeCommands };
