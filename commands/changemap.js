const db = require('../db/index')
// const { getMapName } = require('../util/utils')
const set = require('./set')
const maps = require('../util/maps')

module.exports = {
  name: 'changemap',
  description: 'change map type for a set id\nChoices: d, l, c, a, w',
  aliases: ['changem', 'setmap', 'cm'],
  usage(prefix) {
    return `\`${prefix}changemap 25 d\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    const args = argsStr.split(/ +/)
    if (args.length !== 2)
      throw `Make sure you have the set id and new map type.\nLike this: ${this.usage(process.env.PREFIX)}`
    const setId = parseInt(args[0])
    const mapTypeCode = args[1][0].toLowerCase()

    const mapType = maps.filter(map => map.code === mapTypeCode)[0]
    if (!mapType)
      throw 'The specified map type doesn\'t exist.\nHere\'s the list of available map types: Dryland, Lakes, Continents, Archipelago and Water World'

    // return JSON.stringify(mapType)

    const sql = 'SELECT * FROM set WHERE id = $1 AND guild_id = $2 AND completed = false'
    const values = [setId, message.guild.id]
    const { rows } = await db.query(sql, values)
    if (rows.length < 1)
      throw 'Looks like you may be trying to change map type for a completed, deleted, nonexistant set or one in another server.\nYou should make sure you have the right id!'

    // const sqlup = 'UPDATE set SET tribes = $1 WHERE id = $2'
    // const valuesup = [[tribeKeys[0], tribeKeys[1]], setId]
    // await db.query(sqlup, valuesup)

    message.channel.send(`New tribes for set ${args[0]}!\n${tribe1} vs ${tribe2}`)
    return set.execute(message, setId, embed)
  }
};