const tribes = require('./tribes')

module.exports.getUserById = function(guild, id) {
  const user = guild.members.cache.filter(x => x.user.id === id)

  return user.first().user
}

module.exports.getUser = function(guild, name) {
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
  return user.first().user
}

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