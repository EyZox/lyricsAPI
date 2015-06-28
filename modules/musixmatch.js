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
	var lyricsDiv = window.document.getElementById('lyrics-html');
	if(lyricsDiv !== null) {
		lyricsData = lyricsDiv.innerHTML.split(/\n{2}/);
		for(var i = 0; i< lyricsData.length; i++) {
			lyricsData[i] = lyricsData[i].split(/\n/);
		}
	}
	
	return lyricsData;
};


module.exports = Musixmatch;