const { getSeasonRole } = require('../util/utils')

module.exports = {
  name: 'signup',
  description: 'sign up for the current season',
  aliases: ['singup', 'register'],
  usage(prefix) {
    return `\`${prefix}signup\``
  },
  category: 'Signup',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message) {
    // EXECUTE

    const member = message.guild.member(message.author.id)

    try {
      const seasonRole = await getSeasonRole(message.guild.roles)
      if(member.roles.cache.has(seasonRole.id))
        throw `You are already registered for **${seasonRole.name}**!`

      member.roles.add(seasonRole.id)
      return `I registered you for **${seasonRole.name}**!`
    } catch (error) {
      return error
    }
  }
}