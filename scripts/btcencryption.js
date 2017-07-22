// Description:
//   Allow connect each user with a private key for signitures and encryption.
//

const ec = require('elliptic').ec('secp256k1')
const c  = require('crypto')
const cs = require('coinstring')
const ci = require('coininfo')
const CK = require('coinkey')
const secp = require('secp256k1')
const bs58 = require('bs58')

x = _ => !(_.compare((new Buffer('0000000000000000000000000000000000000000000000000000000000000001', 'hex'))) < 0)
      && !(_.compare((new Buffer('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140', 'hex'))) > 0)
         ? _
         : x(c.randomBytes(32)) ;

module.exports = bot => {
  var  keys;

  bot.brain.on('loaded', () => {
    keys = bot.brain.data.keys || (bot.brain.data.keys = {});
delete keys['U02JGQLSQ']
delete keys['183771581829480448']
    bot.brain.save();
  })
  bot.respond(/key me/i, r => {
    if(keys[r.message.user.id]) return r.send("You already have a keypair.")
    r.send("Done. You may now encrypt, sign, or generate coin addresses.")
  })
  bot.respond(/crypto me ?(.+)?$/i, r => {
    const userID = r.message.user.id;
    if(r.match[1]) coin = r.match[1].toLowerCase(); else coin = 'bitcoin'
    if(!keys[userID] && r.match[1]) return r.send(createMe(userID) + '\n' + cryptoMe(userID, coin))
    if(!keys[userID]) return r.send(createMe(userID))
    if(keys[userID][coin]) return r.send("You already have a " + coin +  " keypair.")
    r.send(cryptoMe(userID, coin))
  })

  cryptoMe = (userID, version) => {
    if(!(vByte = versionMe(version))) return "Sorry but thats not a valid coin."
    importKey = cs.encode(Buffer.concat([keys[userID].private, (new Buffer('01', 'hex'))]), vByte);
    var ck = CK.fromWif(importKey);
    keys[userID][version] = {
      address: ck.publicAddress,
      importKey: importKey
    };
    bot.brain.save()
    return 'Done, your address is `' + ck.publicAddress + '`.'
  }

  versionMe = version => {
    switch(version) {
      case 'bitmark':
        return 0xD5
      default:
        return 0x80
    }
  }
  createMe = userID => {
    keys[userID] = {
      private: x(c.randomBytes(32)),
      get public() { return secp.publicKeyCreate(this.private, true) }
    }
    return "Base keypair created, you may encrypt, sign, or generate coin addresses."
  }
}

// Old code, no dependencies.
//publicKey = secp.publicKeyCreate(privKey, true)  // true => isCompressed
//buffer = c.createHash('sha256').update(publicKey).digest()
//paytoPublicKeyHash = c.createHash('ripemd160').update(hash).digest()
//version   = new Buffer('55', 'hex')
//buffer  = Buffer.concat([version, hash])
//buffer  = c.createHash('sha256').update(checksum).digest()
//buffer  = c.createHash('sha256').update(checksum).digest()
//checksum  = buffer.slice(0, 4)
//address   = bs58.encode(Buffer.concat([version, hash, checksum]))

//privPlusVersion = new Buffer('d5' + ecKey.getPrivate().toString('hex') + '01', 'hex')
//buffer     = c.createHash('sha256').update(privPlusVersion).digest()
//buffer     = c.createHash('sha256').update(hash).digest()
//checksum   = buffer.slice(0, 4)
//importKey  = bs58.encode(Buffer.concat([privPlusVersion, checksum]))