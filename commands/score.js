const db = require('../db/index')
const { getUser } = require('../util/utils')
const set = require('./set')

module.exports = {
  name: 'score',
  description: 'declare score for set',
  aliases: ['sc'],
  usage(prefix) {
    return `\`${prefix}score 25 player1 11000 player2 12000\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    // EXECUTE

    const args = argsStr.split(/ +/)
    if(args.length !== 5)
      throw `This command requires an id, both players and both scores\nIn this order: ${this.usage(process.env.PREFIX)}`

    const setId = args[0]
    const player1 = getUser(message.guild, args[1])
    const player2 = getUser(message.guild, args[3])
    const player1_pts = parseInt(args[2])
    const player2_pts = parseInt(args[4])

    try {
      const sqlget = 'SELECT * FROM set INNER JOIN points ON id = set_id WHERE id = $1'
      const valuesget = [setId]
      const ressel = await db.query(sqlget, valuesget)
      const resPlayers = [ ressel.rows[0].player_id, ressel.rows[1].player_id ]
      if(ressel.rows[0].completed && !message.member.hasPermission('MANAGE_GUILD' || 'ADMINISTRATOR'))
        throw 'Only moderators can override a score for a completed game.'
      if(ressel.rows[0].completed && message.member.hasPermission('MANAGE_GUILD' || 'ADMINISTRATOR'))
        message.channel.send('You have just overridden the previous score for this game.')

      if(!(resPlayers.some(x => x === player1.id) && resPlayers.some(x => x === player2.id)))
        throw `It seems like one of **@${player1.username}** or **@${player2.username}** isn't this in this game.\nMaybe you need more characters to find the right player or verify the players of this set with \`${process.env.PREFIX}set ${setId}\``

      const sql1 = 'UPDATE points SET points = $1 WHERE set_id = $2 AND player_id = $3'
      const values1 = [player1_pts, setId, player1.id]

      await db.query(sql1, values1)

      const sql2 = 'UPDATE points SET points = $1 WHERE set_id = $2 AND player_id = $3'
      const values2 = [player2_pts, setId, player2.id]

      await db.query(sql2, values2)

      const sql = 'UPDATE set SET completed = true WHERE id = $1'
      const values = [ressel.rows[0].id]
      await db.query(sql, values)

      return set.execute(message, ressel.rows[0].id, embed)
    } catch(err) {
      throw err
    }
  }
};