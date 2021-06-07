const db = require('../db/index')
const { MessageEmbed } = require('discord.js')

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
    const sqlseason = 'SELECT season FROM seasons WHERE guild_id = $1 ORDER BY season DESC LIMIT 1'
    const valuesseason = [message.guild.id]
    const resSeason = await db.query(sqlseason, valuesseason)
    const currentSeason = parseInt(resSeason.rows[0].season)

    const args = argsStr.split(/ +/)
    const season = parseInt(args[0])

    if (isNaN(season))
      throw `This command requires the season number like this: ${this.usage(process.env.PREFIX, currentSeason)}`

    if (season < 8)
      throw 'I wasn\'t around back then... :sweat_smile:'

    if (season > currentSeason)
      throw 'I\'m not a wizard, Harry.'

    if (season === currentSeason)
      throw `Try \`${process.env.PREFIX}lb\` for the current season's leaderboard.`

    const sqlAgg = 'SELECT * FROM lb WHERE season = $1 AND is_pro = false AND guild_id = $2 ORDER BY rank'
    const valuesAgg = [season, message.guild.id]
    const resAgg = await db.query(sqlAgg, valuesAgg)
    const rowsAgg = resAgg.rows

    let index = 0
    rowsAgg.forEach(orderedPlayer => {
      index = index + 1
      embed.addField(`${index}. **${orderedPlayer.player_tag}**`, `(${orderedPlayer.wins}/${orderedPlayer.losses}/${orderedPlayer.ties}): **${orderedPlayer.ratio}**\n`)
    })

    embed.setTitle(`Leaderboard for season ${season}`)
    message.channel.send(embed)

    const sqlAggPro = 'SELECT * FROM lb WHERE season = $1 AND is_pro = true AND guild_id = $2 ORDER BY rank'
    const valuesAggPro = [season, message.guild.id]
    const resAggPro = await db.query(sqlAggPro, valuesAggPro)
    const rowsAggPro = resAggPro.rows

    if (rowsAggPro.length < 1)
      return

    const proEmbed = new MessageEmbed().setColor('#ED80A7')

    index = 0
    rowsAggPro.forEach(orderedPlayer => {
      index = index + 1
      proEmbed.addField(`${index}. **${orderedPlayer.player_tag}**`, `(${orderedPlayer.wins}/${orderedPlayer.losses}/${orderedPlayer.ties}): **${orderedPlayer.ratio}**\n`)
    })

    proEmbed.setTitle(`Leaderboard for **pro** season ${season}`)

    return proEmbed
  }
};