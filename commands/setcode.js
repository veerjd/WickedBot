const db = require('../db/index')

module.exports = {
  name: 'setcode',
  description: 'define your own Polytopia code',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}setcode W8ch0lbiI44Esx6H\``
  },
  category: 'Basic',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr) {

    const args = argsStr.split(/ +/)

    if(args.length > 1)
      throw 'Looks like you\'re trying to set someone else\'s code (which I don\'t support)...\nPing them to have them set their own codes!'

    if(args[0].length !== 16)
      throw 'Why trying to put a random code... :thinking:'

    const user = message.author

    const sqlgc = 'SELECT * FROM codes WHERE player_id = $1'
    const valuesgc = [user.id]
    const ressel = await db.query(sqlgc, valuesgc)

    let res
    if(!ressel.rows[0]) {
      const sql = 'INSERT INTO codes (player_id, code) VALUES ($1, $2) RETURNING code'
      const values = [user.id, args[0]]
      res = await db.query(sql, values)
    } else {
      const sql = 'UPDATE codes SET code = $1 WHERE player_id = $2 RETURNING code'
      const values = [args[0], user.id]
      res = await db.query(sql, values)
    }

    message.channel.send(`You just ${!ressel.rows[0] ? 'set' : 'updated'} your code to:`)
    return `\`${res.rows[0].code}\``
  }
};