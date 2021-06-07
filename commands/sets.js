const db = require('../db/index')
const { getTribe, getUser } = require('../util/utils')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'sets',
  description: 'all sets for current season',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}sets [all OR player]\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {

    const setDesc = []
    const sqlseason = 'SELECT season FROM seasons WHERE guild_id = $1 ORDER BY season DESC LIMIT 1'
    const valuesseason = [message.guild.id]
    const resSeason = await db.query(sqlseason, valuesseason)
    const season = resSeason.rows[0].season

    const sql = 'SELECT * FROM set WHERE season = $1 AND guild_id = $2 ORDER BY id'
    const values = [season, message.guild.id]
    const resSets = await db.query(sql, values)
    let sets = resSets.rows

    const sqlusers = 'SELECT * FROM points LEFT JOIN set ON set_id = id WHERE season = $1 ORDER BY set_id'
    const valuesusers = [season]
    const resPoints = await db.query(sqlusers, valuesusers)
    let points = resPoints.rows

    if (argsStr.includes('all')) {
      if (sets.length === 0)
        return embed.setDescription(`There are no sets yet for season ${season}`)

      const incompletes = sets.filter(x => x.completed === false && !x.is_pro)
      const completes = sets.filter(x => x.completed === true && !x.is_pro)
      const incompletesPro = sets.filter(x => x.completed === false && x.is_pro)
      const completesPro = sets.filter(x => x.completed === true && x.is_pro)

      const otherEmbed = new MessageEmbed().setColor('#ED80A7')
      otherEmbed.setColor('#ED80A7')
      otherEmbed.setTitle(`There are ${incompletesPro.length + completesPro.length} total games for **pro** season ${season}.\n${incompletesPro.length} incompletes and ${completesPro.length} completed.`)
        .setDescription(`You can use \`${process.env.PREFIX}incomplete all\` and \`${process.env.PREFIX}completed all\` to see the sets' details!`)

      message.channel.send(otherEmbed)
      embed.setTitle(`There are ${incompletes.length + completes.length} total games for regular season ${season}.\n${incompletes.length} incompletes and ${completes.length} completed.`)
        .setDescription(`You can use \`${process.env.PREFIX}incomplete all\` and \`${process.env.PREFIX}completed all\` to see the sets' details!`)
    } else {
      const mention = message.mentions.users.first()
      let user
      if (mention)
        user = getUser(message.guild, mention.username)
      else if (argsStr)
        user = getUser(message.guild, argsStr.toLowerCase())
      else
        user = getUser(message.guild, message.author.username)

      const userPoints = points.filter(x => x.player_id === user.id)
      sets = sets.filter(x => userPoints.some(y => y.set_id === x.id))
      const incompletes = sets.filter(x => x.completed === false)
      const completes = sets.filter(x => x.completed === true)
      points = points.filter(x => sets.some(y => y.id === x.set_id))

      embed.setTitle(`There are ${sets.length} total games for season ${season}.\n${incompletes.length} incompletes and ${completes.length} completed.`)
      sets.forEach(set => {
        const setPoints = points.filter(x => x.set_id === set.id)
        set.player1 = setPoints[0].player_id
        set.player2 = setPoints[1].player_id
      })

      if (sets.length === 0)
        return embed.setTitle((argsStr) ? `There are no sets for ${user} during season ${season}` : `You have no sets for season ${season}`)

      setDesc.push(`**All sets for ${user} during season ${season}**`)
      setDesc.push('')
      sets.forEach(x => {
        const player1 = message.client.users.cache.get(x.player1)
        const player2 = message.client.users.cache.get(x.player2)
        const tribe1 = getTribe(x.tribes[0], message.guild.emojis.cache)
        const tribe2 = getTribe(x.tribes[1], message.guild.emojis.cache)
        setDesc.push(`${x.is_pro ? 'Pro ' : ''}${x.id}: ${player1} & ${player2}`)
        setDesc.push(`${tribe1} & ${tribe2}`)
        setDesc.push('')
      })

      embed.setDescription(setDesc)
    }

    return embed
  }
};