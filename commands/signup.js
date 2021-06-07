const { getRegularSeasonRole, isPlayerPro } = require('../util/utils')
const db = require('../db/index')

module.exports = {
  name: 'signup',
  description: 'sign up for the current regular season',
  aliases: ['singup', 'register'],
  usage(prefix) {
    return `\`${prefix}signup\``
  },
  category: 'Basic',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message) {
    try {
      const sqlseason = 'SELECT season FROM seasons WHERE guild_id = $1 ORDER BY season DESC LIMIT 1'
      const valuesseason = [message.guild.id]
      const resSeason = await db.query(sqlseason, valuesseason)
      const season = resSeason.rows[0].season

      const member = message.guild.member(message.author.id)

      const sql = 'SELECT * FROM codes WHERE player_id = $1'
      const values = [member.user.id]
      const { rows } = await db.query(sql, values)

      if (member.roles.cache.size < 2)
        throw 'You need to do a few more practice sets to get familiar with the format and see if you enjoy it enough to commit to a season.\nAfter that, you can request the @**Novice** role to @**Moderator**s.\nMay the odds ever be in your favor!'

      if (rows.length < 1)
        throw `Make sure you've set your Polytopia in-game name using \`${process.env.PREFIX}setname\``

      const seasonRole = await getRegularSeasonRole(message.guild.roles)
      if (member.roles.cache.has(seasonRole.id))
        throw `You are already registered for **${seasonRole.name}**!`

      const isPro = await isPlayerPro(message.author.id, season, message.guild.id)

      if (isPro)
        throw 'You can\'t signup for the regular season if you\'re in the pro league.'

      member.roles.add(seasonRole.id)
      const admin = message.guild.channels.cache.get('696740669804380210')
      const chat = message.guild.channels.cache.get('433950651358380034')

      admin.send(`${member.user} just signed up for **${seasonRole.name}**!\nCome say congrats in ${chat}!`)
      return `I registered you for **${seasonRole.name}**!`
    } catch (error) {
      return error
    }
  }
}