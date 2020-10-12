const tribes = require('./tribes')
const db = require('../db/index')

module.exports.getUserById = function(guild, id) {
  const user = guild.members.cache.filter(x => x.user.id === id)

  if(user.first())
    return user.first().user
}

module.exports.findIsProSet = async function(player1, player2, season) {
  const isPlayerOnePro = await module.exports.isPlayerPro(player1.id, season)
  const isPlayerTwoPro = await module.exports.isPlayerPro(player2.id, season)

  if(isPlayerOnePro && isPlayerTwoPro)
    return true
  else if(isPlayerOnePro !== isPlayerTwoPro)
    throw 'Both players have to be in the same league (Pro or Regular) to create a ranked set.'
  else
    return false
}

module.exports.isPlayerPro = async function(player_id, season) {
  const sql = 'SELECT * FROM pro WHERE player_id = $1 AND season = $2'
  const values = [player_id, season]
  const { rows } = await db.query(sql, values)

  if(rows.length < 1)
    return false
  else
    return true
}

module.exports.getUser = function(guild, name) {
  const members = guild.members.cache.filter(x => {
    let found

    if(x.nickname) {
      found = x.nickname.toLowerCase().includes(name.toLowerCase()) || x.user.username.toLowerCase().includes(name.toLowerCase())
    } else {
      found = x.user.username.toLowerCase().includes(name.toLowerCase())
    }

    return found
  })

  if(members.size === 0)
    throw `There is no players matching **${name}**... ¯\\_(ツ)_/¯`
  if(members.size > 1)
    throw `There's more than one player matching **${name}**`
  return members.first().user
}

/* module.exports.getMember = function(guild, name) {
  const user = guild.members.cache.filter(x => {
    let found

    if(x.nickname) {
      found = x.nickname.toLowerCase().includes(name.toLowerCase()) || x.user.username.toLowerCase().includes(name.toLowerCase())
    } else {
      found = x.user.username.toLowerCase().includes(name.toLowerCase())
    }

    return found
  })

  if(user.size === 0)
    throw `There is no players matching **${name}**... ¯\\_(ツ)_/¯`
  return user.first()
} */

module.exports.getTribe = function(tribeCode, emojis) {
  const tribe = tribes[tribeCode.toUpperCase()]

  const tribeEmoji = emojis.filter(x => x.name === tribe.emoji)

  return tribeEmoji.first()
}

module.exports.getRandomTribes = function() {
  const randomKey = function(obj) {
    const keys = Object.keys(obj);
    const key = keys[ keys.length * Math.random() << 0]
    return key;
  };

  const randomTribeKey1 = randomKey(tribes)
  let randomTribeKey2
  do {
    randomTribeKey2 = randomKey(tribes)
  } while(randomTribeKey1 === randomTribeKey2)

  return [randomTribeKey1, randomTribeKey2]
}

/*
player = {
  "set_id":
  "player_id":
  "points":
  "result":
  "malus":
  "gamescore":
  "fullscore":
}
*/
module.exports.getWinner = function(player1, player2) {
  if(player1.pointsWithMalus > player2.pointsWithMalus) {
    player1.result = 'win'
    player2.result = 'loss'
  } else if(player1.pointsWithMalus < player2.pointsWithMalus) {
    player1.result = 'loss'
    player2.result = 'win'
  } else {
    player1.result = 'tie'
    player2.result = 'tie'
  }
}

module.exports.getRegularSeasonRole = async function(rolesManager) {
  const sql = 'SELECT * FROM leagues WHERE type = \'regular\''
  const { rows } = await db.query(sql)

  const regularSeasonRole = rolesManager.cache.get(rows[0].role_id)

  if(regularSeasonRole)
    return regularSeasonRole
  else {
    throw 'There is a problem that <@217385992837922819> will need to fix :disappointed:.\nI couldn\'t find the regular season role.'
  }
}

module.exports.getProSeasonRole = async function(rolesManager) {
  const sql = 'SELECT * FROM leagues WHERE type = \'pro\''
  const { rows } = await db.query(sql)

  const proSeasonRole = rolesManager.cache.get(rows[0].role_id)

  if(proSeasonRole)
    return proSeasonRole
  else {
    throw 'There is a problem that <@217385992837922819> will need to fix :disappointed:.\nI couldn\'t find the pro season role.'
  }
}