'use strict';

var PsychBot = require('../lib/psychbot');

var token = process.env.SLACK_BOT_TOKEN;
var name = 'psychiatrist';

var psych = new PsychBot({
    token: token,
    name: name
});

psych.run();
