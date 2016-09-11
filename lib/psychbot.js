'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');

var PsychBot = function PsychBot(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'psychiatrist';
    this.id = -1;

    this.user = null;

    this._welcomeMessage = function () {
        this.postMessageToChannel(this.channels[0].name, 'Hello, how may I help you?',
            {as_user: true});
    };

    this._isChatMessage = function (message) {
        return message.type === 'message' && Boolean(message.text);
    };

    this._isChannelConversation = function (message) {
        return typeof message.channel === 'string' &&
            message.channel[0] === 'C';
    };

    this._isFromPsychBot = function (message) {
        return message.user === this.user.id;
    };

    this._isMentioningPsychBot = function (message) {
	atBot = '<@' + this.id + '>';
	console.log('atBot: ' + atBot);
        return message.text.toLowerCase().indexOf('psychiatrist') > -1 || message.text.toLowerCase().indexOf(atBot) > -1 ||
            message.text.toLowerCase().indexOf(this.name) > -1;
    };

    this._reply = function (originalMessage) {
        var self = this;
        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, 'test message', {as_user: true});
    };

    this._onMessage = function (message) {
        if (this._isChatMessage(message) &&
            this._isChannelConversation(message) &&
            !this._isFromPsychBot(message) &&
            this._isMentioningPsychBot(message)
        ) {
            this._reply(message);
        }
    };

    this._getChannelById = function (channelId) {
        return this.channels.filter(function (item) {
            return item.id === channelId;
        })[0];
    };

    this._loadBotUser = function () {
        var self = this;
        this.user = this.users.filter(function (user) {
            return user.name === self.name;
        })[0];
	console.log('bot id: ' + JSON.stringify(this.user.id));
	this.id = this.user.id;
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
