'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');
var botMind = require('./mind');

var PsychBot = function PsychBot(settings) {
	this.settings = settings;
	this.settings.name = this.settings.name || 'psychiatrist';

	this.user = null;

	this._welcomeMessage = function () {
		this.postMessageToChannel(this.channels[0].name, 'Hello, how may I help you?', {
			as_user: true
		});
	};

	this._isChatMessage = function (message) {
		//console.log('is chat message');
		return message.type === 'message' && Boolean(message.text);
	};

	this._isChannelConversation = function (message) {
		return typeof message.channel === 'string' && message.channel[0] === 'C';
	};

	this._isFromPsychBot = function (message) {
		//console.log('is from psychbot');
		return message.user === this.user.id;
	};

	this._isMentioningPsychBot = function (message) {
		//console.log('is mentioning bot' + message.text.toLowerCase());
		//<@u2a0pje2e> -- very bad here; it may change!
		return (message.text.toLowerCase().indexOf('psychiatrist') > -1 || message.text.toLowerCase().indexOf('<@u2a0pje2e>') > -1 ||
			message.text.toLowerCase().indexOf(this.name) > -1);
	};

	this._reply = function (originalMessage, answer) {
		console.log('answer in reply is: ' + answer);
		var self = this;
		if (this._isChannelConversation(originalMessage)) {
			var channel = self._getChannelById(originalMessage.channel);
			self.postMessageToChannel(channel.name, answer, {
				as_user: true
			});
		} else {
			self.postMessageToUser(self._getUserById(originalMessage.user), answer, {
				as_user: true
			});
		}

	};

	this._onMessage = function (message) {
		if (this._isChatMessage(message) &&
			(!this._isChannelConversation(message) || this._isMentioningPsychBot(message)) &&
			!this._isFromPsychBot(message)
		) {
			this._reply(message, botMind.botMind._getAnswer(message.text));
		}
	};

	this._getChannelById = function (id) {
		return this.channels.filter(function (item) {
			return item.id === id;
		})[0];
	};

	this._getUserById = function (id) {
		var usr = this.users.filter(function (item) {
			return item.id === id;
		})[0];
		return usr.name;
	};

	this._loadBotUser = function () {
		var self = this;
		this.user = this.users.filter(function (user) {
			return user.name === self.name;
		})[0];
	};

	this._onStart = function () {
		this._loadBotUser();
	};

	this.run = function () {
		PsychBot.super_.call(this, this.settings);

		this.on('start', this._onStart);
		this.on('message', this._onMessage);
	};

};

// inherits methods and properties from the Bot constructor
util.inherits(PsychBot, Bot);

module.exports = PsychBot;
