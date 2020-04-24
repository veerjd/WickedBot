module.exports = {
  name: 'help',
  description: 'list all the commands details',
  aliases: ['commands', 'command'],
  usage(prefix) {
    return `\`${prefix}help\``
  },
  // You can have as many categories as you want, just make sure to update the help.js file with them
  category: 'hidden', // Since 'hidden' category isn't in the categoriesMapped (see line 36), it won't display in the help command
  // Required perms of the author of the message
  permsAllowed: ['VIEW_CHANNEL'],
  // User that can do the command regardless of .permsAllowed
  usersAllowed: [''],
  execute(message, argsStr, embed) {
    // Pulling all the commands that are defined in index.js (line 8-13)
    const { commands } = message.client;
    // Get the defined command, if there is one
    const argsArray = argsStr.split(/ +/)
    // Get Command Object
    const command = commands.get(argsArray[0]) || commands.find(alias => alias.aliases && alias.aliases.includes(argsArray[0]))
    // let doesntHavePerms

    // Define if the user doesn't have necessary perms to get the help card of the defined
    // if(command && command.permsAllowed)
    //   doesntHavePerms = !(command.permsAllowed.some(x => message.member.hasPermission(x)) || command.usersAllowed.some(x => x === message.author.id))

    // // If the author doesn't have perm
    // if(doesntHavePerms)
    //   throw 'You don\'t have what it takes to use this :sunglasses:\nYou can try `.help` to get the list of commands!'

    // If the command doesn't exist or author doesn't have perms
    if (argsStr.length != 0/* && !doesntHavePerms*/) {
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
        Basic: {},
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