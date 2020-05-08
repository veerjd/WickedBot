const db = require('../db/index')

module.exports = {
  name: 'nextseason',
  description: 'increment to next season',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}nextseason\``
  },
  category: 'Staff',
  permsAllowed: ['MANAGE_GUILD', 'ADMINISTRATOR'],
  execute: async function() {

    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const season = resSeason.rows[0].season

    const sql = 'SELECT * FROM set WHERE completed = false AND season = $1 ORDER BY id'
    const values = [season]
    const resSets = await db.query(sql, values)

    if(resSets.rows.length > 0)
      throw `There are still ${resSets.rows.length} incomplete sets for season ${season}.\nYou can get all of them with \`${process.env.PREFIX}incomplete all\` and mark them as completed with \`${process.env.PREFIX}score\`.`

    const today = new Date().toLocaleDateString()

    const sqlnew = 'INSERT INTO seasons (season, start_date) VALUES ($1, $2)'
    const valuesnew = [season + 1, today]
    await db.query(sqlnew, valuesnew)
    return `We are now season ${season + 1}!`
  }
};