// Description:
//   Generates help commands for Hubot.
//
// Commands:
//   hubot help - Displays all of the help commands that this bot knows about.
//   hubot help <query> - Displays all help commands that match <query>.
//
// URLS:
//   /hubot/help
//
// Configuration:
//   HUBOT_HELP_REPLY_IN_PRIVATE - if set to any avlue, all `mubot help` replies are sent in private
//   HUBOT_HELP_DISABLE_HTTP - if set, no web entry point will be declared
//   HUBOT_HELP_HIDDEN_COMMANDS - comma-separated list of commands that will not be displayed in help
//
// Notes:
//   These commands are grabbed from comment blocks at the top of each file.
//

(function() {
  var getHelpCommands, helpContents, hiddenCommandsPattern;

  helpContents = function(name, commands) {
     return "<!DOCTYPE html>\n<html>\n  <head>\n  <meta charset=\"utf-8\">\n  <title>" + name + " Help</title>\n  <style type=\"text/css\">\n    body {\n      background: #d3d6d9;\n"
     + " color: #636c75;\n      text-shadow: 0 1px 1px rgba(255, 255, 255, .5);\n      font-family: Helvetica, Arial, sans-serif;\n    }\n    h1 {\n      margin: 8px 0;\n      padding: 0;\n"
     + "    }\n    .commands {\n      font-size: 13px;\n    }\n    p {\n      border-bottom: 1px solid #eee;\n      margin: 6px 0 0 0;\n      padding-bottom: 5px;\n    }\n    p:last-child {\n"
     + "      border: 0;\n    }\n  </style>\n  </head>\n  <body>\n    <h1>" + name + " Help</h1>\n    <div class=\"commands\">\n      " + commands + "\n    </div>\n  </body>\n</html>";
  };

  module.exports = function(robot) {
    robot.respond(/help(?:\s+(.*))?$/i, function(msg) {
      var cmds, emit, filter, ref, ref1;
      cmds = getHelpCommands(robot);
      filter = msg.match[1];
      if (filter) {
        cmds = cmds.filter(function(cmd) {
          return cmd.match(new RegExp(filter, 'i'));
        });
        if (cmds.length === 0) {
          msg.send("No available commands match " + filter);
          return;
        }
      }
      emit = cmds.join('\n');
      if (filter) {
        return msg.send(emit);
      } else {
        return robot.send({
          room: (ref = msg.message) != null ? (ref1 = ref.user) != null ? ref1.id : void 0 : void 0
        }, emit);
      }
    });
    if (process.env.HUBOT_HELP_DISABLE_HTTP == null) {
      return robot.router.get("/" + robot.name + "/help", function(req, res) {
        var cmds, emit;
        cmds = renamedHelpCommands(robot).map(function(cmd) {
          return cmd.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        });
        if (req.query.q != null) {
          cmds = cmds.filter(function(cmd) {
            return cmd.match(new RegExp(req.query.q, 'i'));
          });
        }
        emit = "<p>" + (cmds.join('</p><p>')) + "</p>";
        emit = emit.replace(new RegExp(robot.name, 'ig'), "<b>" + robot.name + "</b>");
        res.setHeader('content-type', 'text/html');
        return res.end(helpContents(robot.name, emit));
      });
    }
  };

  getHelpCommands = function(robot) {
    var help_commands, robot_name;
    help_commands = robot.helpCommands();
    robot_name = robot.alias || robot.name;
    if (hiddenCommandsPattern()) {
      help_commands = help_commands.filter(function(command) {
        return !hiddenCommandsPattern().test(command);
      });
    }
    help_commands = help_commands.map((command) => command.replace(/^(hubot|mubot)/i, robot_name));
    return help_commands.sort();
  };

  hiddenCommandsPattern = function() {
    var hiddenCommands, ref;
    hiddenCommands = (ref = process.env.HUBOT_HELP_HIDDEN_COMMANDS) != null ? ref.split(',') : void 0;
    if (hiddenCommands) {
      return new RegExp("^(hubot|mubot) (?:" + (hiddenCommands != null ? hiddenCommands.join('|') : void 0) + ") - ");
    }
  };

}).call(this);