/**
 * Create instance of Lololyrics
 * @constructor
 */
var Lololyrics = function() {}

/**
 * Gets potential matching for result
 * @param {Array} result
 * @returns {Number} corresponding URL potential matching 
 */
Lololyrics.prototype.accept = function(result) {
	return (/http:\/\/www.lololyrics.com\/lyrics\/[0-9]+\.html/.test(result['url']))?1:0;
}
/**
 * Get lyrics data
 * @param error
 * @param window : Allow you to use JDOM
 * @returns {Array} lyrics
 */
Lololyrics.prototype.getLyrics = function(window) {
	var lyricsData;
	var lyricsDiv = window.document.getElementById('lyrics_txt');
	if(lyricsDiv !== null) {
		lyricsDiv.innerHTML = lyricsDiv.innerHTML.substr(0,lyricsDiv.innerHTML.indexOf('<!--')).trim();
		lyricsData = lyricsDiv.innerHTML.replace(/\s{2,}/g, ' ').replace(/\n/g, '').split(/<br>\s*<br>/gi);
		for(var i = 0; i< lyricsData.length; i++) {
			lyricsData[i] = lyricsData[i].split(/<br>\s*/);
		}
	}
	return lyricsData;
};


module.exports = Lololyrics;