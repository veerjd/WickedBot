require('dotenv').config();
const { Client, MessageEmbed, Collection } = require('discord.js');
const bot = new Client();
const fs = require('fs')
const prefix = process.env.PREFIX
const db = require('./db/index')

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
  console.log(`Logged in as ${bot.user.username} ${process.env.PREFIX}`);

  bot.user.setActivity(`${prefix}help`, { type: 'PLAYING' })
});

// --------------------------------------
//
//      EVENT ON MESSAGE
//
// --------------------------------------
bot.on('message', async message => {

  try {
    if (message.author.bot || !message.content.startsWith(prefix) || message.content === prefix)
      return

    // If it's a DM
    if (message.channel.type === 'dm')
      message.channel.send('I do not support DM commands.')
        .then().catch(console.error)

    // Command handling
    const textStr = message.content.slice(prefix.length)
    const commandName = textStr.split(/ +/).shift().toLowerCase();
    const argsStr = textStr.slice(commandName.length + 1)

    // Map all the commands
    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // Return if the command doesn't exist
    if (!command || command.permsAllowed === undefined)
      return

    // const wickedbot = message.guild.channels.cache.get('696894142625742905')
    // const proMatchmaking = message.guild.channels.cache.get('762784243155730492')
    // const adminbot = message.guild.channels.cache.get('702447004105703424')
    // const matchmaking = message.guild.channels.cache.get('558364419139043363')
    // if (!(message.channel.id === wickedbot.id || message.channel.id === proMatchmaking.id || message.channel.id === adminbot.id || message.channel.id === matchmaking.id) && command.category !== 'Basic')
    //   return message.channel.send(`You need to be in ${wickedbot}, ${matchmaking}, ${proMatchmaking} or ${adminbot} to use this command of mine.`)

    if (message.member.roles.cache.size < 1 && command.category !== 'Basic')
      return message.channel.send('You need a player role to use the bot. Do a practice set then contact the Mods. Good luck!')

    if (command.category === 'Staff' && (!command.permsAllowed.some(x => message.member.hasPermission(x)) && message.author.id !== '217385992837922819'))
      return message.channel.send('Only an admin can use this command, sorry!')

    // Instantiate the embed that's sent to every command execution
    const embed = new MessageEmbed().setColor('#008800')


    // EXECUTE COMMAND
    const reply = await command.execute(message, argsStr, embed);

    // if there's a reply, send it
    if (reply)
      message.channel.send(reply)
        .then().catch(console.error)
    return
  } catch (error) {
    // If error, log it and reply it
    console.log(error.stack || error)
    return message.channel.send(`${error}`)
      .then().catch(console.error)
  }
})

bot.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (oldMember.roles.cache.size >= newMember.roles.cache.size)
    return

  const newRoles = newMember.roles.cache
  newRoles.forEach((role, id) => {
    if (oldMember.roles.cache.has(id))
      newRoles.delete(id)
  })

  const sqlseason = 'SELECT season FROM seasons ORDER BY season DESC LIMIT 1'
  const resSeason = await db.query(sqlseason)
  const season = resSeason.rows[0].season

  if (newRoles.first().name != 'Novice')
    return

  const chat = newMember.guild.channels.cache.get('433950651358380034')
  return chat.send(`${newMember.user} just finished training and was awarded the @**Novice** role!\nThey now can \`${process.env.PREFIX}signup\` for **Season ${season}** and start playing sets with everyone!`)
})

bot.on('error', error => {
  console.error('ERROR', error.stack)
})

bot.login(process.env.TOKEN);