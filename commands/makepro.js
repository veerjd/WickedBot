const db = require('../db/index')
const { getProSeasonRole, getUser } = require('../util/utils')

module.exports = {
  name: 'makepro',
  description: 'tell the bot this is a pro player for the current season',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}makepro alph gere zork sila\``
  },
  category: 'Staff',
  permsAllowed: ['MANAGE_GUILD', 'ADMINISTRATOR'],
  // eslint-disable-next-line no-unused-vars
  execute: async function(message, argsStr, embed) {
    const args = argsStr.split(/ +/).filter(i => i)

    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const season = resSeason.rows[0].season

    if(args.length < 1)
      throw 'You need to specify at least one player by text or ping.'

    const proRole = await getProSeasonRole(message.guild.roles)

    args.forEach(newPro => {
      const user = getUser(message.guild, newPro)
      const member = message.guild.member(user)
      member.roles.add(proRole)
        .then(roleAdded => {
          const sql = 'INSERT INTO pro (player_id, season) VALUES ($1, $2)'
          const values = [user.id, season]
          db.query(sql, values)
            .then(() => {
              message.channel.send(`${roleAdded} is a pro for **Season ${season}**!`)
            }).catch(err => { throw err })
        }).catch(() => {
          message.channel.send(`There was a problem adding the pro role to ${newPro} for **Season ${season}**!`)
        })
    })
  }
};