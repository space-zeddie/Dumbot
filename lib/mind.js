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
	
       var res= processQuestionFirstWord(answerVariant,sent);
	return res;
	/*if (isQuestion(sent)) {
       var res= processQuestionFirstWord(answerVariant,sent);
        
        console.log("RES:"+res.text);
        return res;
		//return processQuestion(res, sent);
	} else {
        
		return processNonQuestion(answerVariant, sent);
}*/
    
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
    var input =sent;
for(var i =0;i<input.length;i++){
    if(contains(storage.subject_pronouns,input[i].toLowerCase())){
          console.log("Pronouns");
        return true;
    }console.log(input[i].toLowerCase());
}return false;
}
function findSubjectPronoun(sent){
    var input = sent;
    var res="";
for(var i =0;i<input.length;i++){
   if(contains(storage.subject_pronouns,input[i].toLowerCase())){
         if(input[i].match(/I/i)){
            res="you";
             return res;
        }
        if(input[i].match(/you/i)){
            res="I";
            return res;
        }
       res=input[i];
        console.log("Pronoun:"+res);
        return res;
    }
}return null;
}
function hasArticle(input){
for(var i =0;i<input.length;i++){
    console.log("Articles");
  if(contains(storage.articles,input[i].toLowerCase())){
        return true;
    }console.log(input[i].toLowerCase());
}return false;
}
function findArticle(input){
    var res ="";
for(var i =0;i<input.length;i++){
    if(contains(storage.articles,input[i].toLowerCase())){
        if(input[i].match(/am/i)){
            res="are";
            return res;
        }
        if(input[i].match(/are/i)){
            res="am";
            return res;
        }
         if(input[i].match(/was/i)){
            res="were";
             return res;
        }
        if(input[i].match(/were/i)){
            res="was";
            return res;
        }
        res =input[i];
         console.log("Article:"+res);
        return res;
    }
}return null;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);}

function containsWhQuestion(inputArray) {
   return (contains(inputArray,"where") || contains(inputArray,"what") || contains(inputArray,"how") || contains(inputArray,"who") || contains(inputArray,"when") ||
        contains(inputArray,"which") || contains(inputArray,"why"));
}

function isYesOrNoQuestion(inputArray) {
    return (contains(storage.yesno_questions, inputArray[0]));
}

function containsModals(inputArray) {
    res = false;
    storage.modalverbs.forEach(function(v) {
         if (contains(inputArray, v)) 
            res = true;
    });
    return res;
}

function processQuestionFirstWord(answerVariant, sent){
    answerVariant._mark /= 2;
    console.log("processing question .........");
    var txt ="";
    sent = sent.toLowerCase();
    sent = sent.replace(/[.,\/#!$%\^&\?\*;:{}=\-_`~()]/g,"");
    sent = sent.replace(/\s{2,}/g," ");
    console.log("sent:"+sent);
    var inputArray = sent.split(" ");
    if (containsWhQuestion(inputArray) || isYesOrNoQuestion(inputArray)) {
        console.log('found a question');
        if (inputArray.length <= 1)
            txt += "I'm afraid you're going to have to be more specific";
	else if (containsModals(inputArray)) {
            txt += storage.responsetoyesno[getRandomInt(0,storage.responsetoyesno.length-1)];
        }
	else
            txt += storage.questions[getRandomInt(0,storage.questions.length-1)];
    }
    else {
        txt += storage.waterfallsentences[getRandomInt(0, storage.waterfallsentences.length-1)];
    }
    console.log("response: "+txt);
    
    if(hasPronoun(inputArray)){
        console.log("Has a pronoun"+findSubjectPronoun(inputArray));
            //txt+=" "+findSubjectPronoun(inputArray)+" ";
        }console.log("pronoun..................."+txt);
    if(hasArticle(inputArray)){
         console.log("Has a article"+findArticle(inputArray));
           //txt+=" " +findArticle(inputArray)+" ";
        console.log()
        }
  //  txt+=inputArray.slice(3,inputArray.length-1);
   // txt+=".";
    answerVariant._text=txt;
    console.log("answerVariant.text:"+answerVariant._text);
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
