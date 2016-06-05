/**
 * Create instance of Musixmatch
 * @constructor
 */
var Musixmatch = function() {}

/**
 * Gets potential matching for result
 * @param {Array} result
 * @returns {Number} corresponding URL potential matching 
 */
Musixmatch.prototype.accept = function(result) {
	return (/https:\/\/www.musixmatch.com\/lyrics\/.*/.test(result['url']))?1:0;
}
/**
 * Get lyrics data
 * @param error
 * @param window : Allow you to use JDOM
 * @returns {Array} lyrics
 */
Musixmatch.prototype.getLyrics = function(window) {
	var lyricsData;
	var scripts = window.document.body.getElementsByTagName('script');
	var search_pattern = new RegExp('.*var __mxmState = ({.*}).*');
	for(var i in scripts) {
		var match = search_pattern.exec(scripts[i].innerHTML);
		if(match != null) {
			var lyricsJSON = JSON.parse(match[1]);
			console.log(JSON.stringify(lyricsJSON));
			if(lyricsJSON.page.lyrics.lyrics.body !== undefined) {
				return parseLyrics(lyricsJSON.page.lyrics.lyrics.body);
			}
		}
	}
	
	return [];
};

function parseLyrics(stringLyrics) {
	lyricsData = stringLyrics.split(/\n{2}/);
	for(var i = 0; i< lyricsData.length; i++) {
		lyricsData[i] = lyricsData[i].split(/\n/);
	}
	return lyricsData;
}


module.exports = Musixmatch;