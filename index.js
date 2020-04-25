require('dotenv').config();
const { Client, MessageEmbed, Collection } = require('discord.js');
const bot = new Client();
const fs = require('fs')
const prefix = process.env.PREFIX

// bot.commands as a collection(Map) of commands from ./commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
bot.commands = new Collection();
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

// --------------------------------------
//
//       EVENT ON LOGIN
//
// --------------------------------------
bot.on('ready', () => {
  // eslint-disable-next-line no-console
  console.log(`Logged in as ${bot.user.username}`);

  bot.user.setActivity(`${prefix}help`, { type: 'PLAYING' })
});

// --------------------------------------
//
//      EVENT ON MESSAGE
//
// --------------------------------------
bot.on('message', async message => {
  if(message.author.bot || !message.content.startsWith(prefix) || message.content === prefix)
    return

  // If it's a DM
  if(message.channel.type === 'dm')
    message.channel.send('I do not support DM commands.')
      .then().catch(console.error)

  // Command handling
  const textStr = message.content.slice(prefix.length)
  const commandName = textStr.split(/ +/).shift().toLowerCase();
  const argsStr = textStr.slice(commandName.length + 1)

  // Map all the commands
  const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  // Return if the command doesn't exist
  if(!command || command.permsAllowed === undefined)
    return

  const wickedbot = message.guild.channels.cache.get('696894142625742905')
  const traininggrounds = message.guild.channels.cache.get('701896459028660275')
  const adminbot = message.guild.channels.cache.get('702447004105703424')
  if(!(message.channel.id === wickedbot.id || message.channel.id === traininggrounds.id || message.channel.id === adminbot.id) && command.category !== 'Basic')
    return message.channel.send(`You need to be in ${wickedbot}, ${traininggrounds} or ${adminbot} to this command of mine.`)

  if(message.member.roles.cache.size < 1 && command.category !== 'Basic')
    return message.channel.send('You need a player role to use the bot. Do a practice set then contact the Mods. Good luck!')

  if(command.category === 'Staff' && !command.permsAllowed.some(x => message.member.hasPermission(x)))
    return message.channel.send('Only an admin can use this command, sorry!')

  // Instantiate the embed that's sent to every command execution
  const embed = new MessageEmbed().setColor('#008800')

  try {
    // EXECUTE COMMAND
    const reply = await command.execute(message, argsStr, embed);

    // if there's a reply, send it
    if(reply)
      message.channel.send(reply)
        .then().catch(console.error)
    return
  } catch (error) {
    // If error, log it and reply it
    return message.channel.send(`${error}`)
      .then().catch(console.error)
  }
})

bot.on('error', error => {
  console.error('ERROR', error)
})

bot.login(process.env.TOKEN);