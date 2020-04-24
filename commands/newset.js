const db = require('../db/index')
const { getUser, getTribe, getRandomTribes, getSeasonRole } = require('../util/utils')

module.exports = {
  name: 'newset',
  description: 'create a set with random tribes',
  aliases: ['new'],
  usage(prefix) {
    return `\`${prefix}newset [player1] player2\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    // EXECUTE

    const args = argsStr.split(/ +/)

    let player1
    let player2

    if(args.length === 1) {
      player1 = message.author
      player2 = getUser(message.guild, args[0])
    } else if(args.length === 2) {
      player1 = getUser(message.guild, args[0])
      player2 = getUser(message.guild, args[1])
    } else
      throw `This command needs one or two arguments: one player or two.\n\nLike this: ${this.usage(process.env.PREFIX)}`

    const tribeKeys = getRandomTribes(message.guild.emojis.cache)
    const emojiCache = message.guild.emojis.cache

    const tribe1 = getTribe(tribeKeys[0], emojiCache)
    const tribe2 = getTribe(tribeKeys[1], emojiCache)

    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const season = resSeason.rows[0].season

    const seasonRole = getSeasonRole(message.guild.roles)
    if(!message.member.roles.cache.has(seasonRole))
      throw `You need to signup for **${seasonRole.name}** before you can create a set.\nYou can do that with a simple \`${process.env.PREFIX}signup\`!`

    const sql = 'INSERT INTO set (season, tribes, completed) VALUES ($1, $2, false) RETURNING id, season'
    const values = [season, [tribeKeys[0], tribeKeys[1]]]

    const resSet = await db.query(sql, values)

    const sql1 = 'INSERT INTO points (set_id, player_id, points, bonus) VALUES ($1, $2, 0, 0)'
    const values1 = [resSet.rows[0].id, player1.id]

    await db.query(sql1, values1)

    const sql2 = 'INSERT INTO points (set_id, player_id, points, bonus) VALUES ($1, $2, 0, 0)'
    const values2 = [resSet.rows[0].id, player2.id]

    await db.query(sql2, values2)

    message.channel.send(`New set created\nID: ${resSet.rows[0].id}`)
    embed.setTitle(`Set ID: ${resSet.rows[0].id}`)
      .addField('Players', `${player1}\n${player2}`)
      .addField('Tribes:', `${tribe1} & ${tribe2}`)
      .setFooter(`Season ${resSet.rows[0].season}`)
    return embed
  }
};