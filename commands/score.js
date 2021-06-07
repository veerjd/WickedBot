const db = require('../db/index')
const { getUser, getWinner } = require('../util/utils')
const set = require('./set')

module.exports = {
  name: 'score',
  description: 'declare score for set',
  aliases: ['sc', 'scores'],
  usage(prefix) {
    return `\`${prefix}score 25 player1 16000 player2 16000\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    // EXECUTE

    const args = argsStr.split(/ +/)
    if (args.length !== 5)
      throw `This command requires an id, both players and both scores\nIn this order: ${this.usage(process.env.PREFIX)}`

    const mentions = message.mentions.users

    const setId = args[0]
    let player1 = {}
    let player2 = {}
    if (mentions.size > 0) {
      if (mentions.size === 2) {
        const iterator = mentions.values()
        player1 = iterator.next().value
        player2 = iterator.next().value
      } else
        throw 'You can either ping both users or none to set score :blush:!'
    } else {
      player1 = getUser(message.guild, args[1])
      player2 = getUser(message.guild, args[3])
    }
    player1.points = parseInt(args[2])
    player2.points = parseInt(args[4])
    if (player1.points > 20000) {
      message.channel.send('Maximum points for a player in a set is 20000.')
      player1.points = 20000
    }
    if (player2.points > 20000) {
      message.channel.send('Maximum points for a player in a set is 20000.')
      player2.points = 20000
    }
    if (player1.points < 6000) {
      message.channel.send('Minimum points for a player in a set is 6000.')
      player1.points = 6000
    }
    if (player2.points < 6000) {
      message.channel.send('Minimum points for a player in a set is 6000.')
      player2.points = 6000
    }
    const sqlseason = 'SELECT season FROM seasons WHERE guild_id = $1 ORDER BY season DESC LIMIT 1'
    const valuesseason = [message.guild.id]
    const resSeason = await db.query(sqlseason, valuesseason)
    const season = resSeason.rows[0].season

    const sql1Malus = 'SELECT SUM(malus) AS malus, player_id FROM set INNER JOIN points ON set_id = id WHERE season = $1 AND player_id = $2 AND set_id = $3 AND guild_id = $4 GROUP BY player_id'
    const values1Malus = [season, player1.id, setId, message.guild.id]
    const player1Malus = await db.query(sql1Malus, values1Malus)
    if (player1Malus.rows.length < 1)
      throw 'Are you sure you have the right set ID?'

    player1.malus = parseInt(player1Malus.rows[0].malus)

    const sql2Malus = 'SELECT SUM(malus) AS malus, player_id FROM set INNER JOIN points ON set_id = id WHERE season = $1 AND player_id = $2 AND set_id = $3 AND guild_id = $4 GROUP BY player_id'
    const values2Malus = [season, player2.id, setId, message.guild.id]
    const player2Malus = await db.query(sql2Malus, values2Malus)
    if (player2Malus.rows.length < 1)
      throw 'Are you sure you have the right set ID?'

    player2.malus = parseInt(player2Malus.rows[0].malus)

    player1.pointsWithMalus = player1.points - player1.malus
    player2.pointsWithMalus = player2.points - player2.malus

    getWinner(player1, player2)

    try {
      const sqlget = 'SELECT * FROM set INNER JOIN points ON id = set_id WHERE id = $1 AND guild_id = $2'
      const valuesget = [setId, message.guild.id]
      const ressel = await db.query(sqlget, valuesget)
      if (ressel.rows.length === 0)
        throw 'Looks like there\'s not set this id'
      const resPlayers = [ressel.rows[0].player_id, ressel.rows[1].player_id]
      if (ressel.rows[0].completed && !message.member.hasPermission('MANAGE_GUILD' || 'ADMINISTRATOR'))
        throw 'Only moderators can override a score for a completed game.'
      if (ressel.rows[0].completed && message.member.hasPermission('MANAGE_GUILD' || 'ADMINISTRATOR'))
        message.channel.send('You have just overridden the previous score for this game.')

      if (!(resPlayers.some(x => x === player1.id) && resPlayers.some(x => x === player2.id)))
        throw `It seems like one of **@${player1.username}** or **@${player2.username}** isn't this in this game.\nMaybe you need more characters to find the right player or verify the players of this set with \`${process.env.PREFIX}set ${setId}\``

      message.channel.send(`Here is the score for set ${setId} opposing ${player1} & ${player2}`)

      const sql1 = 'UPDATE points SET points = $1, result = $2 WHERE set_id = $3 AND player_id = $4 AND guild_id = $5'
      const values1 = [player1.points, player1.result, setId, player1.id, message.guild.id]

      await db.query(sql1, values1)

      const sql2 = 'UPDATE points SET points = $1, result = $2 WHERE set_id = $3 AND player_id = $4 AND guild_id = $5'
      const values2 = [player2.points, player2.result, setId, player2.id, message.guild.id]

      await db.query(sql2, values2)

      const sql = 'UPDATE set SET completed = true WHERE id = $1 AND guild_id = $2'
      const values = [ressel.rows[0].id, message.guild.id]
      await db.query(sql, values)

      return set.execute(message, ressel.rows[0].id, embed)
    } catch (err) {
      throw err
    }
  }
};