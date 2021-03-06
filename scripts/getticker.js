// Description:
//   Returns information about crypto coins
//
// Commands:
//   Hubot compare <coin1> <coin2> - returns price/change of coin2 relative to coin1
//   Hubot stats <coin> - returns information about coin
//   Hubot price <coin> - returns the strike price of coin
//
// Author:
//   leathan

(function() {
  module.exports = bot => {
    bot.respond(/stats (\w+)$/i, res => {
      bot.http("https://api.coinmarketcap.com/v1/ticker/").get()((err, res2, body) => {
        body = JSON.parse(body.replace(/\n/g, ''))
        for(let i = 0, l = body.length; i < l; ++i) {
          if(body[i].symbol === res.match[1].toUpperCase()) {
            return res.send(JSON.stringify(body[i], null, 2))
          }
        }
        res.send(res.match[1] + " is not listed.")
      })
    });
    bot.respond(/price (\w+)$/i, res => {
      bot.http("https://api.coinmarketcap.com/v1/ticker/").get()((err, res2, body) => {
        body = JSON.parse(body.replace(/\n/g, ''))
        for(let i = 0, l = body.length; i < l; ++i) {
          if(body[i].symbol === res.match[1].toUpperCase()) {
            return res.send(res.match[1] + " strike price is " + body[i].price_usd + "$.")
          }
        }
        res.send(res.match[1] + " is not listed.")
      })
    });
    bot.respond(/compare (\w+) (\w+)$/i, res => {
      bot.http("https://api.cryptonator.com/api/ticker/" + res.match[1] + "-" + res.match[2]).get()((err, res2, body) => {
        body = JSON.parse(body);
        if(!body.ticker) return res.send("Error comparing those two via cryptonator's API.");
        res.send("One " + body.ticker.base + " gives you " + body.ticker.price + " " + body.ticker.target + ". [24h Change: " + body.ticker.change + "%]")
      })
    })
  }
}).call(this);
