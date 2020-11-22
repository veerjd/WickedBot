const db = require('../db/index')

module.exports = {
  name: 'setname',
  description: 'define your own Polytopia name',
  aliases: ['setcode'],
  usage(prefix) {
    return `\`${prefix}setname alphaSeahorse\``
  },
  category: 'Basic',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function (message, argsStr) {
    const user = message.author

    if (argsStr.length !== 16)
      message.channel.send(`**${user}**, make sure that you are setting your in-game name and not your Polytopia code.\nIf you were inputting your old Polytopia code, make sure to update your game!`)

    const sqlgc = 'SELECT * FROM codes WHERE player_id = $1'
    const valuesgc = [user.id]
    const ressel = await db.query(sqlgc, valuesgc)

    if (!ressel.rows[0]) {
      const sql = 'INSERT INTO codes (player_id, name) VALUES ($1, $2) RETURNING name'
      const values = [user.id, argsStr]
      await db.query(sql, values)
    } else {
      const sql = 'UPDATE codes SET name = $1 WHERE player_id = $2 RETURNING name'
      const values = [argsStr, user.id]
      await db.query(sql, values)
    }

    message.channel.send(`You just ${!ressel.rows[0] ? 'set' : 'updated'} your name to:`)
    return `**${argsStr}**`
  }
};