/**
 * NOTE_1: be careful! Marks are needed to understand how our answer fits the 
 * input sentence; mark (as number) means the depth in tree of possible answers,
 * so for those ones we can fit the best we do not have to look for it a lot
 * Best mark is '0', worst - 'INFINITY'
 */
var Stor = require('./package');

var storage = Stor.Storage;
var LAST_CACHED_ANSWER = null;
var ANSWER_CACHE = [];
var IN_MESSAGE = null;
var INPUT_OBJ = {
	_sent: []
}

var processQuestion = function (answerObj, question) {
	//questions are (at least) twice more important
	answerObj._mark /= 2;
	return answerObj;
}

var processNonQuestion = function (answerObj, sent) {
	return answerObj;
}

var isQuestion = function (input) {
	if (input.match(/[\w\W]*([\W]*\?[\W]*)$/g)) {
		return true;
	}
	return false;
}

var processSentence = function (sent) {
	var answerVariant = {
			_text: sent,
			_mark: Math.pow(10, 6) // <-- SEE NOTE_1
		}

	var res = processQuestionFirstWord(answerVariant, sent);
	return res;

};

function contains(a, obj) {
	for (var i = 0; i < a.length; i++) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
}

function inputContainsElementOfArray(inputArray, array) {
	res = false;
	array.forEach(function (v) {
		if (contains(inputArray, v))
			res = true;
	});
	return res;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function containsWhQuestion(inputArray) {
	return inputContainsElementOfArray(inputArray, storage.special_questions);
}

function whClause(inputArray) {
	res = null;
	storage.special_questions.forEach(function (v) {
		if (contains(inputArray, v))
			res = v;
	});
	return res;
}

// note that this method accepts the text and the array as arguments
function isResponseQuestion(inputText, inputArray) {
	return (contains(storage.response_questions, inputText) || inputArray.length < 3 && contains(storage.special_questions, inputArray[0]));
}

function isYesOrNoQuestion(inputArray) {
	return (contains(storage.yesno_questions, inputArray[0]));
}

function containsModals(inputArray) {
	return inputContainsElementOfArray(inputArray, storage.yesno_questions);
}

function isGreeting(inputArray) {
	return inputContainsElementOfArray(inputArray, storage.normalgreetings);
}

function isFarewell(inputArray) {
	return inputContainsElementOfArray(inputArray, storage.farewells);
}

function generateResponseForWQType(wqtype, inputArray) {
	switch (wqtype) {
		case 'why':
			return storage.why_q[getRandomInt(0, storage.why_q.length - 1)]
			break;
		case 'how':
			return storage.how_q[getRandomInt(0, storage.how_q.length - 1)]
			break;
		case 'which':
			return storage.which_q[getRandomInt(0, storage.which_q.length - 1)]
			break;
		case 'whose':
			return storage.whose_q[getRandomInt(0, storage.whose_q.length - 1)]
			break;
		case 'what':
			return storage.what_q[getRandomInt(0, storage.what_q.length - 1)]
			break;
		case 'where':
			return storage.where_q[getRandomInt(0, storage.where_q.length - 1)]
			break;
		case 'when':
			return storage.when_q[getRandomInt(0, storage.when_q.length - 1)]
			break;
		default:
			return storage.questions[getRandomInt(0, storage.questions.length - 1)]
	}
}

function processQuestionFirstWord(answerVariant, sent) {
	answerVariant._mark /= 2;
	console.log("processing question .........");
	var txt = "";
	sent = sent.toLowerCase();
	sent = sent.replace(/[.,\/#!$%\^&\?\*;:{}=\-_`~()]/g, "");
	sent = sent.replace(/\s{2,}/g, " ");
	console.log("sent:" + sent);
	var inputArray = sent.split(" ");
	var wqtype = whClause(inputArray);
	if (wqtype || isYesOrNoQuestion(inputArray)) {
		console.log('found a question');
		if (inputArray.length <= 1)
			txt += "I'm afraid you're going to have to be more specific";
		else if (containsModals(inputArray))
			txt += storage.responsetoyesno[getRandomInt(0, storage.responsetoyesno.length - 1)];
		else if (isResponseQuestion(sent, inputArray))
			txt += storage.respquestions[getRandomInt(0, storage.respquestions.length - 1)];
		else if (wqtype)
			txt += generateResponseForWQType(wqtype, inputArray);
		else
			txt += storage.questions[getRandomInt(0, storage.questions.length - 1)];
	} else if (isGreeting(inputArray)) {
		txt += storage.greeting[getRandomInt(0, storage.greeting.length - 1)];
	} else if (isFarewell(inputArray)) {
		txt += storage.goodbye[getRandomInt(0, storage.goodbye.length - 1)];
	} else if (contains('because', inputArray)) {
		txt += storage.because_reply[getRandomInt(0, storage.because_reply.length - 1)];
	} else if (contains('sorry', inputArray)) {
		txt += storage.sorry_reply[getRandomInt(0, storage.sorry_reply.length - 1)];
	} else {
		txt += storage.waterfallsentences[getRandomInt(0, storage.waterfallsentences.length - 1)];
	}
	console.log("response: " + txt);
	answerVariant._text = txt;
	console.log("answerVariant.text:" + answerVariant._text);
	return answerVariant;
}

function addToCacheStack(item, lim) {  
    if (ANSWER_CACHE.length >= lim) {
       for (var i = 1; i < ANSWER_CACHE.length; ++i) {
           ANSWER_CACHE[i] = ANSWER_CACHE[i-1];
       }
    }
    ANSWER_CACHE.push(item);
}

var createAnswer = function (input) {
	var answer = {
		_variants: []
	};
	//split text into sentences
	var match = input.match(/[^\.!\?]+[\.!\?]+/g);
	INPUT_OBJ._sent = (match) ? match : [input];
	//console.log('INPUT_OBJ._sent: '+INPUT_OBJ._sent);
	var limit = 10;
	INPUT_OBJ._sent.forEach(function (x) {
                var s = processSentence(x);
                while (contains(ANSWER_CACHE, s._text) && limit > 0) {
                   s = processSentence(x);
                   limit -= 1;
                }
                // clear overloaded cache
                if (limit <= 0) { ANSWER_CACHE = []; limit=10; }
		answer._variants.push(s);
		console.log('variant: ' + processSentence(x)._text + '; mark: ' + processSentence(x)._mark);
	});
	//choosing the best answer (which sentence is most important
	//or which one we can answer the best)
	var finalAns = answer._variants[0];
	answer._variants.forEach(function (v) {
		if (v._mark < finalAns._mark) {
			finalAns = v;
		}
	});
        addToCacheStack(finalAns._text, limit);
	return finalAns._text;
};

var botMind = {
	_getAnswer: function (input) {
		IN_MESSAGE = input += '.';
		//nothing clever yet
		LAST_CACHED_ANSWER = createAnswer(input);
		return LAST_CACHED_ANSWER;
	}
}

exports.botMind = botMind;
