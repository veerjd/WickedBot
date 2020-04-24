const db = require('../db/index')
const { getUser, getWinner } = require('../util/utils')
const set = require('./set')

module.exports = {
  name: 'penalty',
  description: 'set points penalty for infractions',
  aliases: ['malus'],
  usage(prefix) {
    return `\`${prefix}penalty flash 25 1000\``
  },
  category: 'Staff',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    // EXECUTE

    const args = argsStr.split(/ +/)
    if(args.length !== 3)
      throw `This command requires a player, an id and the point penalty amount.\nIn this order: ${this.usage(process.env.PREFIX)}`

    const setId = parseInt(args[1])
    const playerInput = getUser(message.guild, args[0])
    const malus = parseInt(args[2])

    const sqlc = 'SELECT completed FROM test_set WHERE id = $1'
    const valuesc = [setId]
    const resc = await db.query(sqlc, valuesc)
    const completed = resc.rows[0].completed
    if(!completed)
      throw 'As of right now, I only support inputting penalty after the set is over by using `$score`\nTry `$help score` if you aren\'t sure how to use it'

    const sqlp = 'SELECT * FROM test_points WHERE set_id = $1'
    const valuesp = [setId]
    const resp = await db.query(sqlp, valuesp)
    const player1 = resp.rows[0]
    const player2 = resp.rows[1]

    if(playerInput.id === player1.player_id) {
      player1.malus = malus
      player1.pointsWithMalus = player1.points - player1.malus
      player2.pointsWithMalus = player2.points - player2.malus
      getWinner(player1, player2)
    } else if (playerInput.id === player2.player_id) {
      player2.malus = malus
      player1.pointsWithMalus = player1.points - player1.malus
      player2.pointsWithMalus = player2.points - player2.malus
      getWinner(player1, player2)
    } else
      throw 'The specified player isn\'t in this set...'

    const sql1 = 'UPDATE test_points SET malus = $1, result = $2 WHERE player_id = $3 AND set_id = $4'
    const values1 = [player1.malus, player1.result, player1.player_id, setId]
    await db.query(sql1, values1)

    const sql2 = 'UPDATE test_points SET malus = $1, result = $2 WHERE player_id = $3 AND set_id = $4'
    const values2 = [player2.malus, player2.result, player2.player_id, setId]
    await db.query(sql2, values2)

    return set.execute(message, setId, embed)
  }
};