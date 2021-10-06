const db = require('../db/index')
const { getUserById, getRegularSeasonRole, getProSeasonRole } = require('../util/utils')
/**
 * 1. Get season number
 * 2. Check if there are any incomplete games
 * 3. Checks if at least three people have 3 completed games
 * 4. Generate lbs
 * 5. Save lbs in table lb + add 1 to the role name
 * 6. Insert new season and save its date
 */
module.exports = {
  name: 'nextseason',
  description: 'increment to next season',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}nextseason\``
  },
  category: 'Staff',
  permsAllowed: ['MANAGE_GUILD', 'ADMINISTRATOR'],
  // eslint-disable-next-line no-unused-vars
  execute: async function(message, argsStr, embed) {

    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const season = resSeason.rows[0].season

    const sql = 'SELECT * FROM set WHERE completed = false AND season = $1 ORDER BY id'
    const values = [season]
    const resSets = await db.query(sql, values)

    if (resSets.rows.length > 0)
      throw `There are still ${resSets.rows.length} incomplete sets for season ${season}.\nYou can get all of them with \`${process.env.PREFIX}incomplete all\` and mark them as completed with \`${process.env.PREFIX}score\`.`

    const sqlAgg = 'SELECT COUNT(id), SUM(points), SUM(malus) AS malus, is_pro, player_id FROM set INNER JOIN points ON set_id = id WHERE season = $1 AND completed = true GROUP BY player_id, is_pro HAVING COUNT(id) >= 3'
    const valuesAgg = [season]
    const resAgg = await db.query(sqlAgg, valuesAgg)
    const rowsAgg = resAgg.rows
    if (rowsAgg.length < 2)
      throw `Looks like not enough players have enough games (3 players needed) for a leaderboard to be generated yet for season ${season}`

    const sqllb = 'SELECT * FROM set WHERE completed = true AND season = $1 ORDER BY id'
    const valueslb = [season]
    const resSetslb = await db.query(sqllb, valueslb)
    const sets = resSetslb.rows

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

      player.ratio = Number((((parseInt(player.sum) - parseInt(player.malus)) / sumOpponent) * (1.3 - 0.3 * Math.pow(0.85, (player.count - 3)))).toFixed(2))
    })

    const regularRows = rowsAgg.filter(x => !x.is_pro)
    const proRows = rowsAgg.filter(x => x.is_pro)

    function compare(a, b) {
      if (a.ratio < b.ratio)
        return 1;
      if (a.ratio > b.ratio)
        return -1;
      return 0;
    }
    regularRows.sort(compare)
    proRows.sort(compare)

    let index = 0

    const sqlInsert = 'INSERT INTO lb (rank, player_tag, ratio, wins, losses, ties, is_pro, season) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'

    const regularSeasonRole = await getRegularSeasonRole(message.guild.roles)
    regularSeasonRole.edit({ name: `Season ${season + 1}` })
      .then().catch(err => { throw err })

    regularRows.forEach(async orderedPlayer => {
      const user = getUserById(message.guild, orderedPlayer.player_id)
      if (!user)
        return
      index = index + 1

      const data = {
        rank: index,
        player_tag: user.tag,
        wins: orderedPlayer.wins,
        losses: orderedPlayer.losses,
        ties: orderedPlayer.ties,
        ratio: orderedPlayer.ratio
      }

      const valuesInsert = [data.rank, data.player_tag, data.ratio, data.wins, data.losses, data.ties, false, season]

      db.query(sqlInsert, valuesInsert)
        .then(() => {
          const member = message.guild.member(user)
          member.roles.remove(regularSeasonRole)
        }).catch(err => { throw err })
    })

    const proSeasonRole = await getProSeasonRole(message.guild.roles)
    proSeasonRole.edit({ name: `Pro Season ${season + 1}` })
      .then().catch(err => { throw err })

    proRows.forEach(orderedPlayer => {
      const user = getUserById(message.guild, orderedPlayer.player_id)
      if (!user)
        return
      index = index + 1

      const data = {
        rank: index,
        player_tag: user.tag,
        wins: orderedPlayer.wins,
        losses: orderedPlayer.losses,
        ties: orderedPlayer.ties,
        ratio: orderedPlayer.ratio
      }

      const valuesInsert = [data.rank, data.player_tag, data.ratio, data.wins, data.losses, data.ties, true, season]

      db.query(sqlInsert, valuesInsert)
        .then(() => {
          const member = message.guild.member(user)
          member.roles.remove(proSeasonRole)
        }).catch(err => { throw err })
    })

    const today = new Date().toLocaleDateString()

    const sqlnew = 'INSERT INTO seasons (season, start_date) VALUES ($1, $2)'
    const valuesnew = [season + 1, today]
    await db.query(sqlnew, valuesnew)
    return `We are now season ${season + 1}!`
  }
};