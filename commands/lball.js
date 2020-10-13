const { MessageEmbed } = require('discord.js')
const lbpro = require('./leaderboardpro')
const lb = require('./leaderboard')

module.exports = {
  name: 'lball',
  description: 'show season leaderboard without 2 game restriction',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}lball\``
  },
  category: 'Staff',
  permsAllowed: ['MANAGE_GUILD', 'ADMINISTRATOR'],
  execute: async function(message, argsStr, embed) {
    message.lb = 0
    const regLb = await lb.execute(message, argsStr, embed)
    message.channel.send(regLb)

    const otherEmbed = new MessageEmbed().setColor('#ED80A7')
    const proLb = await lbpro.execute(message, argsStr, otherEmbed)
    message.channel.send(proLb)
  }
};