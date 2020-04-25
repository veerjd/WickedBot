const { getSeasonRole } = require('../util/utils')
const db = require('../db/index')

module.exports = {
  name: 'signup',
  description: 'sign up for the current season',
  aliases: ['singup', 'register'],
  usage(prefix) {
    return `\`${prefix}signup\``
  },
  category: 'Basic',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message) {
    // EXECUTE

    const member = message.guild.member(message.author.id)

    const sql = 'SELECT * FROM codes WHERE player_id = $1'
    const values = [member.user.id]
    const { rows } = await db.query(sql, values)

    if(rows.length < 1)
      throw `Make sure you've set your code using \`${process.env.PREFIX}setcode\``

    if(member.roles.cache.size < 1)
      throw 'You need to do a few more practice sets to get familiar with the format and see if you enjoy it enough to commit to a season.\nAfter that, you can request the @**Novice** role to @**Moderator**s.\nMay the odds ever be in your favor!'

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