const { getTribe, getRandomTribes } = require('../util/utils')

module.exports = {
  name: 'tribes',
  description: 'get two random tribes',
  aliases: ['tribe'],
  usage(prefix) {
    return `\`${prefix}tribes\``
  },
  category: 'Basic',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    const tribeKeys = getRandomTribes(message.guild.emojis.cache)
    const emojiCache = message.guild.emojis.cache

    const tribe1 = getTribe(tribeKeys[0], emojiCache)
    const tribe2 = getTribe(tribeKeys[1], emojiCache)

    embed.setTitle('This is the matchup:')
      .setDescription(`${tribe1} vs ${tribe2}`)
    return embed
  }
};