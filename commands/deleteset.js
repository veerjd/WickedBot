const db = require('../db/index')

module.exports = {
  name: 'deleteset',
  description: 'delete set by id',
  aliases: ['del', 'delete'],
  usage(prefix) {
    return `\`${prefix}deleteset 26\``
  },
  category: 'Staff',
  permsAllowed: ['MANAGE_GUILD', 'ADMINISTRATOR'],
  execute: async function(message, argsStr) {
    if (!argsStr || isNaN(parseInt(argsStr)))
      throw 'You need to provide the set id.'

    const sqlset = 'DELETE FROM set WHERE id = $1'
    const values = [argsStr]
    await db.query(sqlset, values)

    const sqlpoints = 'DELETE FROM points WHERE set_id = $1'
    await db.query(sqlpoints, values)
    return `Set ${argsStr} deleted.`
  }
};