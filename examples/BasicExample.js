var LyricsAPI = require('lyricsapi');

var lyrics = new LyricsAPI();
lyrics.debug = true;

lyrics.getLyrics('Frontliner', 'Halos', function(data) {
	if(data === undefined || data.length == 0) {
		console.log('No lyrics found');
	}else {
		for(var strophe = 0; strophe < data.length; strophe++) {
			for(var verse = 0; verse < data[strophe].length; verse++) {
				console.log(data[strophe][verse]);
			}
			console.log('');
		}
	}
});
