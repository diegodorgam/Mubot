# Description:
#   Allows Hubot to (re)load scripts without restart
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#   hubot reload all scripts - Reloads scripts without restart. Loads new scripts too.
#   hubot command count - Tells how many commands hubot knows
#
# Author:
#   spajus

Fs       = require 'fs'
Path     = require 'path'

oldCommands = null
oldListeners = null

module.exports = (robot) ->

  robot.respond /.*command count.*/i, (msg) ->
    msg.send "I am aware of #{msg.robot.commands.length} commands."

  robot.respond /reload$/i, (msg) ->
    try
      oldCommands = robot.commands
      oldListeners = robot.listeners

      robot.commands = []
      robot.listeners = []

      reloadAllScripts msg, success, (err) ->
        msg.send err
    catch error
      console.log "Hubot reloader:", error
      msg.send "Could not reload all scripts: #{error}"

success = (msg) ->
  # Cleanup old listeners and help
  for listener in oldListeners
    listener = {}
  oldListeners = null
  oldCommands = null
  msg.send "Reloaded all scripts."

reloadAllScripts = (msg, success, error) ->
  robot = msg.robot
  unappendedEvents = Object.assign({}, robot.events._events);
  robot.emit('reload_scripts')
  scriptsPath = Path.resolve ".", "scripts"
  robot.load scriptsPath

#  I DONT USE src/scripts
#  scriptsPath = Path.resolve ".", "src", "scripts"
#  robot.load scriptsPath
#  DEPRECIATED LONG TIME AGO
#  hubotScripts = Path.resolve ".", "hubot-scripts.json"
#  Fs.exists hubotScripts, (exists) ->
#    if exists
#      Fs.readFile hubotScripts, (err, data) ->
#        if data.length > 0
#          try
#            scripts = JSON.parse data
#            scriptsPath = Path.resolve "node_modules", "hubot-scripts", "src", "scripts"
#            robot.loadHubotScripts scriptsPath, scripts
#          catch err
#            error "Error parsing JSON data from hubot-scripts.json: #{err}"
#            return
  externalScripts = Path.resolve ".", "external-scripts.json"
  Fs.exists externalScripts, (exists) ->
    if exists
      Fs.readFile externalScripts, (err, data) ->
        if data.length > 0
          try
            scripts = JSON.parse data
            scripts.splice(0, 1) # REMOVES THE FIRST SCRIPT (hubot-server)
          catch err
            error "Error parsing JSON data from external-scripts.json: #{err}"
          robot.loadExternalScripts scripts
          return
  robot.events._events = unappendedEvents
  success(msg)

