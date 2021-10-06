const db = require('../db/index')
const { getTribe, getRandomTribes, getRandomMapTypeCode } = require('../util/utils')
const set = require('./set')

module.exports = {
  name: 'reroll',
  description: 'reroll tribes for a game id',
  aliases: ['roll', 'rr'],
  usage(prefix) {
    return `\`${prefix}reroll 25\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    const argsArray = argsStr.split(/ +/)
    const setId = parseInt(argsArray[0])

    if (!setId || isNaN(parseInt(setId)))
      throw 'You need to provide the set id.'

    const sql = 'SELECT * FROM set WHERE id = $1 AND completed = false'
    const values = [setId]
    const { rows } = await db.query(sql, values)
    if (rows.length < 1)
      throw 'Looks like you may be trying to reroll tribes for a completed, deleted or nonexistant set.\nYou should make sure you have the right id!'

    const tribeKeys = getRandomTribes(message.guild.emojis.cache)

    const wickedServer = message.client.guilds.cache.get('433950651358380032')
    const emojiCache = wickedServer.emojis.cache

    const tribe1 = getTribe(tribeKeys[0], emojiCache)
    const tribe2 = getTribe(tribeKeys[1], emojiCache)

    const sqlup = 'UPDATE set SET tribes = $1, map_type = $2 WHERE id = $3'
    const valuesup = [[tribeKeys[0], tribeKeys[1]], getRandomMapTypeCode(), parseInt(argsStr)]
    await db.query(sqlup, valuesup)

    message.channel.send(`New tribes for set ${argsStr}!\n${tribe1} vs ${tribe2}`)
    return set.execute(message, parseInt(argsStr), embed)
  }
};