const db = require('../db/index')
const { getUser } = require('../util/utils')

module.exports = {
  name: 'code',
  description: 'show code for a user',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}code [alphaseahorse]\``
  },
  category: 'Basic',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr) {

    const mention = message.mentions.users.first()
    let user
    let me = false
    if(mention)
      user = getUser(message.guild, mention.username)
    else if(argsStr)
      user = getUser(message.guild, argsStr.toLowerCase())
    else {
      me = true
      user = getUser(message.guild, message.author.username)
    }

    const sql = 'SELECT * FROM codes WHERE player_id = $1'
    const values = [user.id]
    const { rows } = await db.query(sql, values)

    if(!rows[0])
      throw `There doesn't seem to be a code registered with me for ${me ? `you:\nYou can set your own code with \`${process.env.PREFIX}setcode YOURCODE\`` : `**${user.username}**'s code.\nUnfortunately, as of right now, only ${user} can set his own code (with \`${process.env.PREFIX}setcode YOURCODE\`)`}`

    message.channel.send(`Here is **${user.username}**'s code:`)
    return `\`${rows[0].code}\``
  }
};