// Description:
//   Removes auto save from brain, and writes to disk on save event.
//
// Configureation:
//   set setAutoSave(false) to true, for more writes.
//   currently its set to save just when user balances change.
//
// Author:
//   leathan
//
(function() {
  const fs = require('fs'), Path = require('path');
  const path = Path.join(__dirname, '/../brain.json');
  const write = data => fs.writeFile(path, JSON.stringify(data), 'utf-8', ()=>{});
  module.exports = bot => {
    bot.brain.setAutoSave(false);
    try {
      var data = fs.readFileSync(path, 'utf-8');
      if(data) robot.brain.mergeData(JSON.parse(data))
    } catch(err) {
      if(err.code !== 'ENOENT') console.log(err)
    }
    bot.brain.on('save', write);
    bot.brain.on('close', write);
    bot.brain.on('shutdown', write);
    bot.brain.on('shutdown', write)
  }
}).call(this);
