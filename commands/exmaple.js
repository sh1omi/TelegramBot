'use strict';
const crypto = require('crypto');
module.exports = [
	{
		alias: ['example1'],
		level: 1,
		action: (bot, msg) => {
			bot.sendMessage(msg.chat.id, "Example?");
		}
	},
	{
		alias: ['example2'],
		level: 10, // Level needed to do the command
		action: (bot, msg) => {
			bot.sendMessage(msg.chat.id, "more examples?");
		}
	}
];
