'use strict';

var PsychBot = require('../lib/psychbot');

var token = 'xoxb-78023626082-fIjFixMuaL55bR89NXsTaYVg';
var name = 'psychiatrist';

var psych = new PsychBot({
    token: token,
    name: name
});

psych.run();
