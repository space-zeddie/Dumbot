'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var PsychBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'psychiatrist';
    this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'psychbot.db');

    this.user = null;
    this.db = null;
};

PsychBot.prototype._welcomeMessage = function () {
    this.postMessageToChannel(this.channels[0].name, 'Hello, how may I help you?',
        {as_user: true});
};

PsychBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

PsychBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
};

PsychBot.prototype._isFromPsychBot = function (message) {
    return message.user === this.user.id;
};

PsychBot.prototype._isMentioningPsychBot = function (message) {
    return message.text.toLowerCase().indexOf('psychiatrist') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

PsychBot.prototype._reply = function (originalMessage) {
    var self = this;
    self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, record.joke, {as_user: true});
        self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
    });
};

PsychBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromPsychBot(message) &&
        this._isMentioningPsychBot(message)
    ) {
        this._reply(message);
    }
};

PsychBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

PsychBot.prototype._firstRunCheck = function () {
    var self = this;
    self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var currentTime = (new Date()).toJSON();

        // this is a first run
        if (!record) {
            self._welcomeMessage();
            return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
        }

        // updates with new last running time
        self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
    });
};

PsychBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

PsychBot.prototype._connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
        console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
        process.exit(1);
    }

    this.db = new SQLite.Database(this.dbPath);
};

PsychBot.prototype._onStart = function () {
    this._loadBotUser();
    this._connectDb();
    this._firstRunCheck();
};

PsychBot.prototype.run = function () {
    PsychBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

// inherits methods and properties from the Bot constructor
util.inherits(PsychBot, Bot);

module.exports = PsychBot;
