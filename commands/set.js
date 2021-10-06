const db = require('../db/index')
const { getTribe, getMapName } = require('../util/utils')

module.exports = {
  name: 'set',
  description: 'show set details by id',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}set 13\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    if (isNaN(parseInt(argsStr)))
      throw `This command requires an id.\n\nYou can find ids with \`${process.env.PREFIX}incomplete\``

    const sql = 'SELECT * FROM set INNER JOIN points ON id = set_id WHERE set_id = $1'
    const values = [parseInt(argsStr)]

    const { rows } = await db.query(sql, values)
    if (!rows[0])
      throw 'There doesn\'t seem to be a game with that ID.\nYou can see your incomplete sets with `$incomplete`!'
    const player1 = message.client.users.cache.get(rows[0].player_id)
    const player2 = message.client.users.cache.get(rows[1].player_id)

    const wickedServer = message.client.guilds.cache.get('433950651358380032')
    const emojiCache = wickedServer.emojis.cache

    const tribe1 = getTribe(rows[0].tribes[0], emojiCache)
    const tribe2 = getTribe(rows[0].tribes[1], emojiCache)

    if (rows[0].is_pro)
      embed.setColor('#ED80A7')
    if (rows[0].completed === true) {
      embed.addField('Status:', 'Completed')
        .addField('Players', `${player1}: ${rows[0].points - rows[0].malus}${(rows[0].malus > 0) ? ` (*-${rows[0].malus}*)` : ''}\n${player2}: ${rows[1].points - rows[1].malus}${(rows[1].malus > 0) ? ` (*-${rows[1].malus}*)` : ''}`)
    } else
      embed.addField('Status:', 'Incomplete', true)
        .addField('Map type:', getMapName(rows[0].map_type), true)
        .addField('Players', `${player1}\n${player2}`)
    embed.setTitle(`Set ID: ${rows[0].id}`)
      // .setDescription(`Map type: **${getMapName(rows[0].map_type)}**`)
      .addField('Tribes:', `${tribe1} & ${tribe2}`)
      .setFooter(`Season ${rows[0].season}`)

    return embed
  }
};