const db = require('../db/index')
const { getTribe } = require('../util/utils')
const set = require('./set')
const tribes = require('../util/tribes')

module.exports = {
  name: 'changetribes',
  description: 'change tribes for a set id',
  aliases: ['change', 'settribe', 'changetribe'],
  usage(prefix) {
    return `\`${prefix}changetribes 25 QvO\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    const args = argsStr.split(/ +/)
    if (args.length !== 2)
      throw `Make sure you have the set id and use the format TvT to set.\nLike this: ${this.usage(process.env.PREFIX)}`
    const setId = parseInt(args[0])
    const tribeKeys = args[1].split('v')

    const sql = 'SELECT * FROM set WHERE id = $1 AND completed = false'
    const values = [setId]
    const { rows } = await db.query(sql, values)
    if (rows.length < 1)
      throw 'Looks like you may be trying to change tribes for a completed, deleted, nonexistant set or one in another server.\nYou should make sure you have the right id!'

    const wickedServer = message.client.guilds.cache.get('433950651358380032')
    const emojiCache = wickedServer.emojis.cache

    if (!tribes[tribeKeys[0].toUpperCase()] || !tribes[tribeKeys[1].toUpperCase()])
      throw 'This server uses only **Zebasi**, **Yadakk**, **Xin-Xi**, **Quetzali**, **Oumaji**, **Imperius**, **Hoodrick** and **Aquarion**'

    const tribe1 = getTribe(tribeKeys[0], emojiCache)
    const tribe2 = getTribe(tribeKeys[1], emojiCache)

    const sqlup = 'UPDATE set SET tribes = $1 WHERE id = $2'
    const valuesup = [[tribeKeys[0], tribeKeys[1]], setId]
    await db.query(sqlup, valuesup)

    message.channel.send(`New tribes for set ${args[0]}!\n${tribe1} vs ${tribe2}`)
    return set.execute(message, setId, embed)
  }
};