const db = require('../db/index')

module.exports = {
  name: 'leaderboard',
  description: 'show season leaderboard',
  aliases: ['lb'],
  usage(prefix) {
    return `\`${prefix}lb\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const season = resSeason.rows[0].season

    const sql = 'SELECT SUM(points), player_id FROM test_points INNER JOIN test_set ON set_id = id WHERE season = $1 AND points <> 0 GROUP BY player_id HAVING SUM(points) > 0 ORDER BY SUM(points) DESC'
    const values = [season]
    const { rows } = await db.query(sql, values)

    if(rows.length === 0)
      throw `Looks like no game was completed yet for season ${season}`
    const tops = []

    rows.forEach(scores => {
      const player = message.client.users.cache.get(scores.player_id)
      tops.push(`${player}:  **${scores.sum}**`)
    })
    embed.setTitle(`Leaderboard for season ${season}`)
      .setDescription(tops)
    return embed
  }
};