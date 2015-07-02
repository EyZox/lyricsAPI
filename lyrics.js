var path = require('path');
var request = require('request');
var jsdom = require('jsdom');
var fs = require('fs');
var	XRegExp = require('xregexp').XRegExp;

/**
 * Create instance of Lyrics
 * @param {String} configuration filepath
 * @param {boolean|undefined} debug
 * @constructor
 */
var Lyrics = function(config, debug) {

	this.debug = debug !== undefined && debug;

	if(config === undefined) config = path.resolve(__dirname, 'config.json');
	this.log('Loading config from '+config);
	
	var params=JSON.parse(fs.readFileSync(config, 'utf8'));
	
	this.googleapis = {
		key: params['googleapis']['key'],
		cx: params['googleapis']['cx'],
		num: params['googleapis']['num'] === undefined || isNaN(parseInt(params['googleapis']['num'])) ? 1 : parseInt(params['googleapis']['num'])
	};
	
	this.pattern = new XRegExp(params['clear-regexp']+(params['uselessTags'] !== undefined && params['uselessTags'].length>0?('|'+params['uselessTags'].join('|')):''), 'gi');
	this.modules = Array();
	
	
	if(params['modules'] !== undefined) {
		
		var checkFunction = function(classs, function_name) {
			if(typeof classs[function_name] !== 'function') {
				throw new Error('Can\'t find function '+function_name);
			}
		}
		
		for(var i=0; i<params['modules'].length; i++) {
			try {
				var Req = require('./modules/'+params['modules'][i]['name']);
				var reqInstance = new Req();
				
				checkFunction(reqInstance, 'accept');
				checkFunction(reqInstance, 'getLyrics');
				
				var moduleIndex = this.modules.length;
				this.modules[moduleIndex] = {
						instance: reqInstance, 
						coeff: params['modules'][i]['coeff'] === undefined || isNaN(parseInt(params['modules'][i]['coeff'])) ? 1 : parseInt(params['modules'][i]['coeff'])
				};
				
				this.log('Module '+params['modules'][i]['name']+' loaded with coeff '+this.modules[moduleIndex].coeff);
	
			}catch(err) {
				this.log('Unable to load the module '+params['modules'][i]['name']+': '+err);
			}
		}
	}
}

/**
 * Log a message in console if debug activated
 * @param msg
 */
Lyrics.prototype.log = function(msg) {
	if(this.debug) console.log('[LyricsAPI] '+msg);
}

/**
 * Gets a google search URL
 * @param author track's author
 * @param title track's title
 * @returns {String} the google search URL
 * @private
 */
Lyrics.prototype.getGoogleSearchURL = function(author, title) {
	var tags = XRegExp.replace(author+' '+title,this.pattern, ' ').trim().split(/ +/);
	return 'https://www.googleapis.com/customsearch/v1element?key='+this.googleapis.key+'&cx='+this.googleapis.cx+'&num='+this.googleapis.num+'&prettyPrint=false&q='+tags.join('%20');

};

/**
 * Get max potential module and url
 * @param searchURL googleapi url
 * @param callback
 * @private
 */
Lyrics.prototype.getMaxPotentialLyrics = function(searchURL, callback) {
	this.log('Getting max potential lyrics URL from : '+searchURL.replace(/&prettyPrint=false/gi, '')+' ...');
	var that = this;
	request.get(searchURL, function (error, response, body) {
		var json = JSON.parse(body);
		var choice;
		if (json.hasOwnProperty('results')) {
			for(var ires=0; ires<json['results'].length; ires++) {
				var coefGoogle = (that.googleapis.num/(ires+1));
				var moduleMax;
				for(var imod=0; imod<that.modules.length; imod++) {
					var value = coefGoogle*that.modules[imod].instance.accept(json['results'][ires])*that.modules[imod].coeff;
					if(value > 0 && (moduleMax === undefined || moduleMax.value < value)) {
						moduleMax = {mod: that.modules[imod].instance, value:value};
					}
				}
				if(moduleMax !== undefined && (choice === undefined || choice.module.value < moduleMax.value)) {
					choice = {url:json['results'][ires]['url'], module:moduleMax};
				}
			}
		}
		callback(choice);
	});
};

/**
 * Builds lyrics
 * @param choice
 * @param callback
 * @private
 */
Lyrics.prototype.buildLyrics = function(choice, callback){
	this.log('Getting lyrics from : '+choice.url+' ...');
	var that = this;
	jsdom.env(choice.url, function(errors, window) {
		if(errors === null) {
			callback(choice.module.mod.getLyrics(window));
		}else {
			that.log(errors[0]);
			callback();
		}
	});
}

/**
 * Get lyrics
 * @param author track's author
 * @param title track's title
 * @param callback
 * @public
 */
Lyrics.prototype.getLyrics = function(author, title, callback) {
	var that = this;
	this.getMaxPotentialLyrics(this.getGoogleSearchURL(author, title), function(choice) {
		if(choice !== undefined) {
			that.buildLyrics(choice, callback);
		}else {
			that.log('No result found for '+author+' - '+title);
			callback();
		}
	});
}

module.exports = Lyrics;
