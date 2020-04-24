module.exports = {
  name: 'help',
  description: 'list all the commands details',
  aliases: ['commands', 'command'],
  usage(prefix) {
    return `\`${prefix}help\``
  },
  category: 'hidden',
  permsAllowed: ['VIEW_CHANNEL'],
  execute(message, argsStr, embed) {

    const { commands } = message.client;

    const argsArray = argsStr.split(/ +/)

    const command = commands.get(argsArray[0]) || commands.find(alias => alias.aliases && alias.aliases.includes(argsArray[0]))

    if (argsStr.length != 0) {
      if (!command)
        throw `This command doesn't exist.\nGo get some \`${process.env.PREFIX}help\`!`
      else {
        embed.setTitle(`Help card for \`${command.name}\``)
          .setDescription(`Description: ${command.description}`)
          .addField('Usage:', command.usage(process.env.PREFIX))
        if(command.aliases.length > 0)
          embed.addField((command.aliases.length === 1) ? 'Alias:' : 'Aliases', '`' + command.aliases.join('`, `') + '`')
        return embed
      }
    } else {
      const categoriesMapped = {
        Signup: {},
        Main: {},
        Staff: {}
      }

      commands.forEach(cmd => {
        if(cmd.category === 'hidden')
          return
        if(!cmd.permsAllowed.some(x => message.member.hasPermission(x)))
          return

        const category = categoriesMapped[cmd.category]

        category[cmd.name] = {
          name: cmd.name,
          description: cmd.description,
          aliases: cmd.aliases,
          usage: cmd.usage(process.env.PREFIX)
        }
      })

      embed.setTitle('Help card for all commands')
        .setFooter(`For more help on a command: ${process.env.PREFIX}help {command}\nExample: ${process.env.PREFIX}help newset`)

      for (const [cat, commandsList] of Object.entries(categoriesMapped)) {
        const field = []
        for (const [name, details] of Object.entries(commandsList)) {
          field.push(`**${name}**: ${details.usage}`)
        }
        if(field.length > 0)
          embed.addField(`**${cat}:**`, field)
      }
      return embed
    }
  }
};