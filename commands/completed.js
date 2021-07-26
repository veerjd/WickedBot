const db = require('../db/index')
const { getTribe, getUser, getMapName } = require('../util/utils')

module.exports = {
  name: 'completed',
  description: 'completed sets for current season',
  aliases: ['c', 'complete'],
  usage(prefix) {
    return `\`${prefix}complete [all OR player]\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {

    const setDesc = []
    const sqlseason = 'SELECT season FROM seasons WHERE guild_id = $1 ORDER BY season DESC LIMIT 1'
    const valuesseason = [message.guild.id]
    const resSeason = await db.query(sqlseason, valuesseason)
    const season = resSeason.rows[0].season

    const sql = 'SELECT * FROM set WHERE completed = true AND season = $1 AND guild_id = $2 ORDER BY id'
    const values = [season, message.guild.id]
    const resSets = await db.query(sql, values)
    let sets = resSets.rows

    const sqlusers = 'SELECT * FROM points LEFT JOIN set ON set_id = id WHERE completed = true AND season = $1 ORDER BY set_id'
    const valuesusers = [season]
    const resPoints = await db.query(sqlusers, valuesusers)
    let points = resPoints.rows

    if (argsStr.includes('all')) {

      sets.forEach(set => {
        const setPoints = points.filter(x => x.set_id === set.id)
        set.player1 = setPoints[0].player_id
        set.player2 = setPoints[1].player_id
      })

      const completes = sets.filter(x => x.completed === true && !x.is_pro)
      const completesPro = sets.filter(x => x.completed === true && x.is_pro)

      if (sets.length === 0)
        return embed.setDescription(`There are no incomplete sets yet for season ${season}`)

      setDesc.push(`**All ${sets.length} completed sets, ${completes.length} regular and ${completesPro.length} pro, for season ${season}**`)

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
      points = points.filter(x => sets.some(y => y.id === x.set_id))

      sets.forEach(set => {
        const setPoints = points.filter(x => x.set_id === set.id)
        set.player1 = setPoints[0].player_id
        set.player2 = setPoints[1].player_id
      })

      if (sets.length === 0)
        return embed.setDescription((argsStr) ? `There are no completed games for ${user} during season ${season}` : `You have no completed games for season ${season}`)

      setDesc.push(`**All ${sets.length} completed games for ${user} during season ${season}**`)
    }
    setDesc.push('')

    sets.forEach(x => {
      const player1 = message.client.users.cache.get(x.player1)
      const player2 = message.client.users.cache.get(x.player2)

      const wickedServer = message.client.guilds.cache.get('433950651358380032')
      const emojiCache = wickedServer.emojis.cache

      const tribe1 = getTribe(x.tribes[0], emojiCache)
      const tribe2 = getTribe(x.tribes[1], emojiCache)
      // if()
      setDesc.push(`${x.is_pro ? 'Pro ' : ''}${x.id}: ${player1} & ${player2}`)
      setDesc.push(`${tribe1} & ${tribe2} (${getMapName(x.map_type)})`)
      setDesc.push('')
    })
    embed.setDescription(setDesc)
      .setColor('#be8286')
    return embed
  }
};