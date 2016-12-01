const TelegramBot = require('node-telegram-bot-api');
const dateFormat = require('dateformat');
const fs = require('fs');

let cmd = {}, permissions = {};

let LoadModules = () => {
    cmd = {};
    fs.readdirSync(require("path").join(__dirname, "commands")).forEach(function (file) {
        let command = require("./commands/" + file);
        delete require.cache[require.resolve("./commands/" + file)];
        console.log(file + " loaded.");
        for (let i = 0; i < command.length; i++) {
            cmd[command[i].alias[0]] = [];
            cmd[command[i].alias[0]][0] = command[i].action;
            cmd[command[i].alias[0]][1] = command[i].level;
            if (command[i].alias.length != 1) {
                for (let y = 1; y < command[i].alias.length; y++) {
                    cmd[command[i].alias[y]] = command[i].alias[0];
                }
            }
        }
    });

    cmd['level'] = [];
    cmd['level'][0] = (bot,msg) => {
        if (msg.params.length != 2) bot.sendMessage(msg.chat.id, params[0] + " [host] [level]");
        else {
            if (isNaN(msg.params[1])) return bot.sendMessage(msg.chat.id, msg.text + " [host] [Must be a number]");
            let levels;
            levels = JSON.parse(fs.readFileSync('permissions.json', 'utf8'));
            levels[msg.params[0]] = parseInt(msg.params[1]);
            fs.writeFile('permissions.json', JSON.stringify(levels), function (err) {
                if (err) return console.log(err);
                bot.sendMessage(msg.chat.id, msg.params[0] + " is now level " + msg.params[1]);
            });
            permissions = levels;
        }
    };
    cmd['level'][1] = 10;

    cmd['reload'] = [];
    cmd['reload'][0] = (bot,msg) => {
        LoadModules();
        bot.sendMessage(msg.chat.id, Object.keys(cmd).length + " commands loaded");
    };
    cmd['reload'][1] = 10;
};

/* Permissions files */
fs.writeFile("permissions.json", "{}", { flag: 'wx' }, function (err) {
    if (err.code != "EEXIST") return console.log(err);
});
fs.readFile("permissions.json", "utf8", function (err, data) {
    if (err) return console.log(err);
    permissions = JSON.parse(data);
});

/* Client */
let bot = new TelegramBot("YOUR_API_TOKEN", { polling: true });

LoadModules();

bot.on('message', (msg) => {
    if (typeof msg.text != "undefined") {
        if (msg.text[0] == "/") {
            msg.text = msg.text.substr(1);
            msg.params = msg.text.split(" ");
            msg.text = msg.params[0].toLowerCase();
            msg.params.shift();
            if (typeof cmd[msg.text] != "undefined") {
                let level = 1;
                if (typeof permissions[msg.from.username] != "undefined") level = permissions[msg.from.username];
                if (typeof cmd[msg.text][0] == "function") {
                    if (level >= cmd[msg.text][1]) cmd[msg.text][0](bot,msg);
                    else bot.sendMessage(msg.chat.id, "You dont have enough magic to do the command: " + msg.text);
                } else {
                    if (level >= cmd[cmd[msg.text]][1]) cmd[cmd[msg.text]][0](bot,msg);
                    else bot.sendMessage(msg.chat.id, "You dont have enough magic to do the command: " + msg.text);
                }
            }
        }
    }
});