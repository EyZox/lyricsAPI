var request = require('request');
var jsdom = require('jsdom');
var fs = require('fs');
/**
 * Create instance of Lyrics
 * @param {Array} configuration option
 * @constructor
 */
var Lyrics = function(config) {

	/**
	 * Log a message in console
	 * @param msg
	 */
	Lyrics.prototype.log = function(msg) {
		console.log('[Lyrics] '+msg);
	}

	if(config === undefined) config = './config.json';
	this.params=JSON.parse(fs.readFileSync(config, 'utf8'));
	this.log('Loading config from '+config);
	
	for(var i=0; i<this.params['modules'].length; i++) {
		var moduleName = this.params['modules'][i]['name'];
		try {
			var Req = require('./modules/'+this.params['modules'][i]['name']);
			this.params['modules'][i]['name'] = new Req();
			var checkFunction = function(name, that) {
				if(typeof eval('that.params[\'modules\'][i][\'name\'].'+name) !== 'function') {
					throw 'Can\'t find function '+name;
				}
			}
			checkFunction('accept', this);
			checkFunction('getLyrics', this);
			
			this.log('Module '+moduleName+' loaded');

		}catch(err) {
			this.log('Unable to load the module '+moduleName+': '+err);
			this.params['modules'].slice(i,1);
			i--;
		}
	}
}

/**
 * Gets a google search URL
 * @param author track's author
 * @param title track's title
 * @returns {String} the google search URL
 * @private
 */
Lyrics.prototype.getGoogleSearchURL = function(author, title) {
	var pattern = '\\(.*\\)|\\[.*\\]|[^a-zA-Z0-9éèïî ]'+(this.params['uselessTags'].length>0?('|'+this.params['uselessTags'].join('|')):'');
	
	author = author.trim().replace(new RegExp(pattern,'gi'), ' ').trim();
	var authorArray = author.split(/ +/);
	
	title = title.trim().replace(new RegExp(pattern+(authorArray.length>0?('|'+authorArray.join('|')):''), 'gi'), ' ').trim();
	var titleArray = title.split(/ +/);
	
	return 'https://www.googleapis.com/customsearch/v1element?key='+this.params['googleapis']['key']+'&cx='+this.params['googleapis']['cx']+'&num='+this.params['googleapis']['num']+'&prettyPrint=false&q='+authorArray.join('%20')+(titleArray.length>0?('%20'+titleArray.join('%20')):'');

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
				var coefGoogle = (that.params["googleapis"]["num"]/(ires+1));
				var moduleMax;
				for(var imod=0; imod<that.params['modules'].length; imod++) {
					var value = coefGoogle*that.params['modules'][imod]['name'].accept(json['results'][ires])*that.params['modules'][imod]['coeff'];
					if(value > 0 && (moduleMax === undefined || moduleMax.value < value)) {
						moduleMax = {mod: that.params['modules'][imod]['name'], value:value};
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
