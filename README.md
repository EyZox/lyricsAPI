# lyricsAPI

An open source node.js module to get lyrics from a song

## Getting started

### Main code

    var LyricsApi = require('lyricsapi');
    var lyricsApiInstance = new LyricsApi([config (String path)][, debug (boolean)]);
    lyricsApiInstance.getLyrics(<title>,<author>,function(lyricsData) {
        //Do whatever you want
        //lyricsData is an array[Strophe number][Verse number] or an empty array if no result found
    });

That's all you need by default to get lyrics from a song.
A basic example is available on github here : https://github.com/EyZox/lyricsAPI/tree/master/examples

## Advanced help

This section is usefull to customize your result. You don't need to use it to get lyrics from a lot of song.

### Understanding config file

    {
    	"googleapis": {
    		"key": "YOUR GOOGLE CUSTOM SEARCH KEY",
    		"cx": "YOUR GOOGLE CUSTOM SEARCH CX",
    		"num": "MAX RESULT NUMBER"
    	},
    	
    	"modules": [
    		{
    			"name": "MODULE_NAME (file in ./modules without .js)",
    			"coeff": "RESULT COEFF IF LYRICS FOUND"
    		},
    		{
    			...
    		}
    	],
    	
    	"uselessTags": ["SKIPED WORLD TO SEARCH ENGINE", ...],
    	"clear-regexp": "ELEMENTS MATCHING FROM THIS REGEX WILL BE SKIPPED (YOU CAN USE THIS REGEXP API : https://www.npmjs.com/package/xregexp)"
    }
    
### Create your own lyrics-modules

* First you have to create your own google custom search engine to include result from the lyrics website provider you want implement.
* Create a js file in modules directory, look at already implemented lyrics-module for minimum requirement.
* Edit config file, see above.
