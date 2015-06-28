/**
 * Create instance of Limitlesslyrics
 * @constructor
 */
var Lololyrics = function() {}

/**
 * Gets potential matching for result
 * @param {Array} result
 * @returns {Number} corresponding URL potential matching 
 */
Lololyrics.prototype.accept = function(result) {
	return (/http:\/\/limitlesslyrics.com\/.*/.test(result['url']))?1:0;
}
/**
 * Get lyrics data
 * @param error
 * @param window : Allow you to use JDOM
 * @returns {Array} lyrics
 */
Lololyrics.prototype.getLyrics = function(window) {
	var lyricsData;
	var lyricsDiv = window.document.getElementById('main');
	if(lyricsDiv != null) {
		lyricsDiv = lyricsDiv.getElementsByTagName('article');
		if(lyricsDiv.length > 0) {
			lyricsDiv = lyricsDiv[0].getElementsByTagName('div');
			for(var i in lyricsDiv) {
				if(lyricsDiv[i].getAttribute('class') == 'inside-article') {
					lyricsDiv = lyricsDiv[i].getElementsByTagName('div');
					for(i in lyricsDiv) {
						if(lyricsDiv[i].getAttribute('class') == 'entry-content') {
							lyricsDiv = lyricsDiv[i].getElementsByTagName('p');
							var titleFlag = false;
							for(i=0; i<lyricsDiv.length-1; i++) {
								if(!/(<(a|span) )|^[.*]$/i.test(lyricsDiv[i].innerHTML)) {
									if(titleFlag) {
										if(lyricsData === undefined) lyricsData = Array();
										lyricsData[lyricsData.length] = lyricsDiv[i].innerHTML.split(/\s*<br>\s*/);
									}else {
										titleFlag = true;
									}
								}
							}
							break;
						}
					}
					break;
				}
			}
		}
	}
	
	
	return lyricsData;
};


module.exports = Lololyrics;

