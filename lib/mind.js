/**
 * NOTE_1: be careful! Marks are needed to understand how our answer fits the 
 * input sentence; mark (as number) means the depth in tree of possible answers,
 * so for those ones we can fit the best we do not have to look for it a lot
 * Best mark is '0', worst - 'INFINITY'
 */


var LAST_CACHED_ANSWER = null;
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
			_mark: Math.pow(10,6) // <-- SEE NOTE_1
		}
		//console.log('original: ' + sent);
		//console.log('is question: ' + isQuestion(sent));

	if (isQuestion(sent)) {
		return processQuestion(answerVariant, sent);
	} else {
		return processNonQuestion(answerVariant, sent);
}
};



var createAnswer = function (input) {
	var answer = {
		_variants: []
	};
	//split text into sentences
	var match = input.match(/[^\.!\?]+[\.!\?]+/g);
	INPUT_OBJ._sent = (match) ? match : [input];
	//console.log('INPUT_OBJ._sent: '+INPUT_OBJ._sent);

	INPUT_OBJ._sent.forEach(function (x) {
		answer._variants.push(processSentence(x));
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
	return finalAns._text;
};

var botMind = {
	_getAnswer: function (input) {
		//nothing clever yet
		LAST_CACHED_ANSWER = createAnswer(input);
		return LAST_CACHED_ANSWER;
	}
}

exports.botMind = botMind;
