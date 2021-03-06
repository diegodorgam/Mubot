// Description:
//   Allows sending messages over the max length for discord, also enforces power commands.
//
(function() {
  const POWER_COMMANDS = ['create.file', 'view.file', 'create.break', 'create.die'], POWER_USERS = ['183771581829480448', 'U02JGQLSQ'];
  module.exports = bot => {
    const ADAPTER = bot.adapterName;
    bot.listenerMiddleware((context, next, done) => {
      // If its a powerful commnad being issued make sure the user is a power user.
      if(POWER_COMMANDS.includes(context.listener.options.id)) {
        if(POWER_USERS.includes(context.response.message.user.id)) next();
        else {
          context.response.send("I'm sorry, @" + context.response.message.user.name + ", but you don't have access to do that.");
          done()
        }
      } else next()
    });
    bot.responseMiddleware((context, next, done) => {
      if(!context.plaintext || !context.strings[0] || !context.strings[0].length) return done();
      // i is our iterator representing que position of msg chunk.
      (function chunkAndQue(i) {
        // Pad the start of the message, and the end of the message.
        var epad = fpad = ADAPTER === 'discord' ? "**" : "*";
        // our msg chunk
        var chunk;
        // only proceed if we need to break msg down to chunks.
        if(context.strings[i] && context.strings[i].length > 2000) {
          if(context.response.match[0].indexOf('view') === 0) {
            // The command is a view code command
            fpad = '```javascript\n';
            // so pad it with code markdown.
            epad = '```'
          }
          if(context.response.match[0].indexOf('search') === 0) {
            // The command is a search web command
            fpad = '```\n';
            // so pad it with code markdown.
            epad = '```'
          }
          // Try to get biggest chunk possible until newline char.
          chunk = context.strings[i].match(/^[\s\S]{0,1940}\n/);
          if(!chunk) {
            // There was no newline, fallback to biggest chunk.
            chunk = context.strings[i].match(/^[\s\S]{0,1940}/)
          }
          // Apply the pad to large chunk, and que it.
          context.strings.push(fpad + context.strings[i].slice(chunk[0].length));
          // This is the garanteed small chunk. (first out of que)
          context.strings[i] = context.strings[i].slice(0, chunk[0].length) + epad;
          chunkAndQue(++i)
        } else {
          context.strings[0] = fpad + context.strings[0] + epad
        }
      })(0);
      next()
    })
  }
}).call(this);
