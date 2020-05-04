const db = require('../db/index')
const { getTribe, getUser } = require('../util/utils')

module.exports = {
  name: 'incomplete',
  description: 'incomplete sets for current season',
  aliases: ['in', 'i'],
  usage(prefix) {
    return `\`${prefix}incomplete [all OR player]\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {

    const setDesc = []
    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const season = resSeason.rows[0].season

    const sql = 'SELECT * FROM set WHERE completed = false AND season = $1 ORDER BY id'
    const values = [season]
    const resSets = await db.query(sql, values)
    let sets = resSets.rows

    const sqlusers = 'SELECT * FROM points LEFT JOIN set ON set_id = id WHERE completed = false AND season = $1 ORDER BY set_id'
    const valuesusers = [season]
    const resPoints = await db.query(sqlusers, valuesusers)
    let points = resPoints.rows

    if(argsStr.includes('all')) {

      sets.forEach(set => {
        const setPoints = points.filter(x => x.set_id === set.id)
        set.player1 = setPoints[0].player_id
        set.player2 = setPoints[1].player_id
      })

      if(sets.length === 0)
        return embed.setDescription(`There are no incomplete games yet for season ${season}`)

      setDesc.push(`**All incomplete games for season ${season}**`)

    } else {
      const mention = message.mentions.users.first()
      let user
      if(mention)
        user = getUser(message.guild, mention.username)
      else if(argsStr)
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

      if(sets.length === 0)
        return embed.setDescription((argsStr) ? `There are no incomplete games for ${user} during season ${season}` : `You have no incomplete games for season ${season}`)

      setDesc.push(`**All incomplete games for ${user} during season ${season}**`)
    }
    setDesc.push('')

    sets.forEach(x => {
      const player1 = message.client.users.cache.get(x.player1)
      const player2 = message.client.users.cache.get(x.player2)
      const tribe1 = getTribe(x.tribes[0], message.guild.emojis.cache)
      const tribe2 = getTribe(x.tribes[1], message.guild.emojis.cache)
      // if()
      setDesc.push(`${x.id}: ${player1} & ${player2}`)
      setDesc.push(`${tribe1} & ${tribe2}`)
      setDesc.push('')
    })
    embed.setDescription(setDesc)
    return embed
  }
};