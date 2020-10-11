const db = require('../db/index')

module.exports = {
  name: 'oops',
  description: 'go back one season',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}oops\``
  },
  category: 'hidden',
  permsAllowed: ['MANAGE_GUILD', 'ADMINISTRATOR'],
  execute: async function() {
    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const season = resSeason.rows[0].season

    const sql = 'DELETE FROM seasons WHERE season = $1'
    const values = [season]
    await db.query(sql, values)

    const sql2 = 'DELETE FROM lb WHERE season = $1'
    const values2 = [season]
    await db.query(sql2, values2)

    return `We went back in time, to season ${season - 1} bitches!`
  }
};