const { Events } = require('discord.js');

module.exports = {
  name: Events.Debug,
  once: false,
  execute(info) {
    //@note: kind of useless, uncomment if you'd like to
    //console.debug(info);
  },
};
