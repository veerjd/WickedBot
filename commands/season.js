const db = require('../db/index')
const { getUserById } = require('../util/utils')

module.exports = {
  name: 'season',
  description: 'show leaderboard by season',
  aliases: [],
  usage(prefix, currentSeason) {
    return `\`${prefix}season ${currentSeason || 8}\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const currentSeason = parseInt(resSeason.rows[0].season)

    const args = argsStr.split(/ +/)
    const season = parseInt(args[0])

    if(isNaN(season))
      throw `This command requires the season number like this: ${this.usage(process.env.PREFIX, currentSeason)}`

    if(season < 8)
      throw 'I wasn\'t around back then... :sweat_smile:'

    if(season > currentSeason)
      throw 'I\'m not a wizard, Harry.'

    const sqlAgg = 'SELECT COUNT(id), SUM(points), SUM(bonus) AS bonus, SUM(malus) AS malus, player_id FROM set INNER JOIN points ON set_id = id WHERE season = $1 AND completed = true GROUP BY player_id HAVING COUNT(id) >= 2'
    const valuesAgg = [season]
    const resAgg = await db.query(sqlAgg, valuesAgg)
    const rowsAgg = resAgg.rows
    if(rowsAgg.length < 2)
      throw `Looks like not enough players have enough games (3 needed) for a leaderboard to be generated yet for season ${season}`

    const sql = 'SELECT * FROM set WHERE completed = true AND season = $1 ORDER BY id'
    const values = [season]
    const resSets = await db.query(sql, values)
    const sets = resSets.rows

    const sqlpoints = 'SELECT * FROM points LEFT JOIN set ON set_id = id WHERE completed = true AND season = $1 ORDER BY set_id'
    const valuespoints = [season]
    const resPoints = await db.query(sqlpoints, valuespoints)
    const points = resPoints.rows

    rowsAgg.forEach(player => {
      const playerPoints = points.filter(x => x.player_id === player.player_id)
      const playerSets = sets.filter(x => playerPoints.some(y => y.set_id === x.id))
      const opponentsPoints = points.filter(x => playerSets.some(y => y.id === x.set_id && x.player_id !== player.player_id))

      player.wins = playerPoints.filter(x => x.result === 'win').length
      player.losses = playerPoints.filter(x => x.result === 'loss').length
      player.ties = playerPoints.filter(x => x.result === 'tie').length

      let sumOpponent = 0
      opponentsPoints.forEach(x => {
        sumOpponent = sumOpponent + x.points - x.malus
      })

      player.ratio = Number(((parseInt(player.sum) + parseInt(player.bonus) - parseInt(player.malus)) / sumOpponent).toFixed(2))
    })

    function compare(a, b) {
      if (a.ratio < b.ratio)
        return 1;
      if (a.ratio > b.ratio)
        return -1;
      return 0;
    }
    rowsAgg.sort(compare)

    let index = 0
    rowsAgg.forEach(orderedPlayer => {
      const user = getUserById(message.guild, orderedPlayer.player_id)
      if(!user)
        return
      index = index + 1
      embed.addField(`${index}. **${user.username}**`, `(${orderedPlayer.wins}/${orderedPlayer.losses}/${orderedPlayer.ties}): **${orderedPlayer.ratio}**\n`)
    })

    embed.setTitle(`Leaderboard for season ${season}`)
    return embed
  }
};