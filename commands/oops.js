const db = require('../db/index')
const { getRegularSeasonRole, getProSeasonRole } = require('../util/utils')
/**
 * 1. Get current season
 * 2. Delete the season entry
 * 3. Delete saved lb from season - 1
 * 4. Rename the roles to season - 1
 */
module.exports = {
  name: 'oops',
  description: 'go back one season',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}oops\``
  },
  category: 'hidden',
  permsAllowed: ['MANAGE_GUILD', 'ADMINISTRATOR'],
  // eslint-disable-next-line no-unused-vars
  execute: async function(message, argsStr, embed) {
    const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
    const resSeason = await db.query(sqlseason)
    const season = resSeason.rows[0].season

    const sql = 'DELETE FROM seasons WHERE season = $1'
    const values = [season]
    await db.query(sql, values)

    const sql2 = 'DELETE FROM lb WHERE season = $1'
    const values2 = [season - 1]
    await db.query(sql2, values2)

    const regularSeasonRole = await getRegularSeasonRole(message.guild.roles)
    regularSeasonRole.edit({ name: `Season ${season - 1}` })
      .then().catch(err => { throw err })

    const proSeasonRole = await getProSeasonRole(message.guild.roles)
    proSeasonRole.edit({ name: `Season ${season - 1}` })
      .then().catch(err => { throw err })

    return `We went back in time, to season ${season - 1}, bitches!`
  }
};