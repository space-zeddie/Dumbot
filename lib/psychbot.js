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

// inherits methods and properties from the Bot constructor
util.inherits(PsychBot, Bot);

module.exports = PsychBot;
