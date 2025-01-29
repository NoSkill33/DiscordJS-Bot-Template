const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

async function loadComponents(client) {
  const componentTypes = ['buttons', 'dropdowns', 'modals'];
  const components = {};

  componentTypes.forEach((type) => {
    client[type] = new Collection();
  });

  componentTypes.forEach((type) => {
    const componentPath = path.join(__dirname, `../${type}`);

    if (!fs.existsSync(componentPath)) return;

    const readFilesRecursively = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          readFilesRecursively(fullPath);
        } else if (file.endsWith('.js')) {
          const component = require(fullPath);
          if ('customID' in component && 'execute' in component) {
            client[type].set(component.customID, component);
          } else {
            console.error(
              `Component file at ${file} is missing required properties.`,
            );
          }
        }
      }
    };

    readFilesRecursively(componentPath);
  });
}

//@note: synchronize the interaction with the corresponding component
async function synchronizeComponent(interaction, client) {
  if (
    !interaction.isButton() &&
    !interaction.isSelectMenu() &&
    !interaction.isModalSubmit()
  )
    return;

  let component;
  if (interaction.isButton()) {
    //@note: extract the base part (e.g., 'toggle_' or 'deny_')
    const baseId = interaction.customId.split('_')[0] + '_';
    component =
      client.buttons.get(interaction.customId) || client.buttons.get(baseId);
  } else if (interaction.isSelectMenu()) {
    component = client.dropdowns.get(interaction.customId);
  } else if (interaction.isModalSubmit()) {
    component = client.modals.get(interaction.customId);
  }

  if (!component) {
    return interaction.reply({
      content: 'Something went wrong!',
      ephemeral: true,
    });
  }

  try {
    //@note: execute the matched component
    await component.execute(interaction, client);
  } catch (error) {
    console.error('Error executing component:', error);
    await interaction.reply({
      content: 'An error occurred while executing the component.',
      ephemeral: true,
    });
  }
}

module.exports = { loadComponents, synchronizeComponent };
