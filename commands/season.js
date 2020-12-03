const db = require('../db/index')

module.exports = {
  name: 'season',
  description: 'show leaderboard by season',
  aliases: [],
  usage(prefix, currentSeason) {
    return `\`${prefix}season ${currentSeason || 8}\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function (message, argsStr, embed) {
    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const currentSeason = parseInt(resSeason.rows[0].season)

    const args = argsStr.split(/ +/)
    const season = parseInt(args[0])

    if (isNaN(season))
      throw `This command requires the season number like this: ${this.usage(process.env.PREFIX, currentSeason)}`

    if (season < 8)
      throw 'I wasn\'t around back then... :sweat_smile:'

    if (season > currentSeason)
      throw 'I\'m not a wizard, Harry.'

    const sqlAgg = 'SELECT * FROM lb WHERE season = $1 ORDER BY rank'
    const valuesAgg = [season]
    const resAgg = await db.query(sqlAgg, valuesAgg)
    const rowsAgg = resAgg.rows

    let index = 0
    rowsAgg.forEach(orderedPlayer => {
      index = index + 1
      embed.addField(`${index}. **${orderedPlayer.player_tag}**`, `(${orderedPlayer.wins}/${orderedPlayer.losses}/${orderedPlayer.ties}): **${orderedPlayer.ratio}**\n`)
    })

    embed.setTitle(`Leaderboard for season ${season}`)
    return embed
  }
};