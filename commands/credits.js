module.exports = {
  name: 'credits',
  description: 'show the team!',
  aliases: ['cred', 'credit'],
  usage(prefix) {
    return `\`${prefix}credits\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute(message, argsStr, embed) {
    embed.setTitle('**WickedBender bot credits!**')
      .addField('Developer', 'jd (alphaSeahorse)')

    return embed
  }
}