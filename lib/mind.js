/**
 * NOTE_1: be careful! Marks are needed to understand how our answer fits the 
 * input sentence; mark (as number) means the depth in tree of possible answers,
 * so for those ones we can fit the best we do not have to look for it a lot
 * Best mark is '0', worst - 'INFINITY'
 */
var Stor = require('./package');

var storage = Stor.Storage;
var LAST_CACHED_ANSWER = null;
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
			_mark: Math.pow(10,6) // <-- SEE NOTE_1
		}
		//console.log('original: ' + sent);
		//console.log('is question: ' + isQuestion(sent));
	
	if (isQuestion(sent)) {
       var res= processQuestionFirstWord(answerVariant,sent);
		return processQuestion(res, sent);
	} else {
        
		return processNonQuestion(answerVariant, sent);
}
    
};
function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}
function hasPronoun(sent){
    var input =sent.split(" ");
for(word in storage.subject_pronouns){
    if(contains(input,word)){
        return true;
    }
}return false;
}
function findSubjectPronoun(sent){
    var input = sent.split(" ");
for(word in storage.subject_pronouns){
    if(contains(input,word)){
         if(word.match("/I/i")){
            word=you;
        }
        if(word.match("/you/i")){
            word=i;
        }
        return word;
    }
}return null;
}
function hasArticle(input){
for(word in storage.articles){
    if(contains(input,word)){
        return true;
    }
}return false;
}
function findArticle(input){
for(word in storage.articles){
    if(contains(input,word)){
        if(word.match("/am/i")){
            word=are;
        }
        if(word.match("/are/i")){
            word=am;
        }
         if(word.match("/was/i")){
            word=were;
        }
        if(word.match("/were/i")){
            word=was;
        }
        
        return word;
    }
}return null;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);}
function processQuestionFirstWord(answerVariant, sent){
    console.log("processing question .........");
    var txt ="";
    var input = sent.split(" ");
    if(contains(input,"Where")){
        txt+=storage.frequency_words[getRandomInt(0,storage.frequency_words.length)];
       
       } 
    if(contains(input,"What")){
        txt+=storage.frequency_words[getRandomInt(0,storage.frequency_words.length)];
       
       } 
    if(contains(input,"How")){
        txt+=storage.frequency_words[getRandomInt(0,storage.frequency_words.lengh)];
       
       } 
     if(contains(input,"Who")){
        txt+=storage.frequency_words[getRandomInt(0,storage.frequency_words.lengh)];
       
       } 
     if(contains(input,"What")){
        txt+=storage.frequency_words[getRandomInt(0,storage.frequency_words.length)];
       
       } 
    if(contains(input,"When")){
        txt+=storage.frequency_words[getRandomInt(0,storage.frequency_words.length)];
       
       } 
     if(contains(input,"Which")){
        txt+=storage.frequency_words[getRandomInt(0,storage.frequency_words.length)];
       
       } 
    console.log("txt ..................."+txt);
    
    if(hasPronoun(input)){
            txt+=findSubjectPronoun(input);
        }console.log("pronoun..................."+txt);
    if(hasArticle(input)){
            txt+=findArticle(input);
        }var temp = input.split(" ");
    txt+=temp.slice(3,temp.length);
    txt+=".";
    answerVariant.text=txt;
    console.log("answerVariant.text:"+answerVariant);
    return answerVariant;
}



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
		IN_MESSAGE = input+='.';
		//nothing clever yet
		LAST_CACHED_ANSWER = createAnswer(input);
		return LAST_CACHED_ANSWER;
	}
}

exports.botMind = botMind;
