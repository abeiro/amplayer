 

function ucwords(str) {
  //  discuss at: http://phpjs.org/functions/ucwords/
  // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // improved by: Waldo Malqui Silva
  // improved by: Robin
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  //    input by: James (http://www.james-bell.co.uk/)
  //   example 1: ucwords('kevin van  zonneveld');
  //   returns 1: 'Kevin Van  Zonneveld'
  //   example 2: ucwords('HELLO WORLD');
  //   returns 2: 'HELLO WORLD'

  return (str + '')
    .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
      return $1.toUpperCase();
    });
}

function extractLyrics() {

	superstring="";
	$("#lyricsCanvas").html(superstring)
	re=/(&#[0-9]{1,4};)/gm;
	if (!gUseInternalProxy)
		lyrUrl="http://lyrics.wikia.com/"+conn._songs.root.song[currentSong].artist.replace(/ /g,"_")+":"+ucwords(conn._songs.root.song[currentSong].title).replace(/ /g,"_").replace(/'/g,"%27")
	else
		lyrUrl="proxy.php?url="+encodeURIComponent("http://lyrics.wikia.com/"+conn._songs.root.song[currentSong].artist.replace(/ /g,"_")+":"+conn._songs.root.song[currentSong].title.replace(/ /g,"_"));

	$.get(lyrUrl,function (e) {
		pass1=e.replace(/<br[\s\S]\/>/mg,'&#182;')
		
		pass2=pass1.match(re);
		
		for (i=0;i<pass2.length;i++) {
			superstring+=pass2[i]
		};
		pass3=superstring.replace(/&#182;/mg,'<br/>')
		$("#lyricsCanvas").html(pass3)
	} ).fail(function() {
			console.log("No lyrics found");
			$("#lyricsCanvas").html("No lyrics found")
		});

}

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function getBandInfo() {
	////*[@id="mw-content-text"]/table[1]/tbody/tr/td[2]/table
	superstring="";
	$("#lyricsCanvas").html(superstring)
	re=/(&#[0-9]{1,4};)/gm;
	if (!gUseInternalProxy)
		lyrUrl="https://en.wikipedia.org/wiki/"+conn._songs.root.song[currentSong].artist.replace(/ /g,"_").replace(/ /g,"_").replace(/'/g,"%27")
	else
		lyrUrl="proxy.php?url="+encodeURIComponent("https://en.wikipedia.org/wiki/"+conn._songs.root.song[currentSong].artist.replace(/ /g,"_").replace(/'/g,"%27"));

	$.get(lyrUrl,function (e) {
		//target=document.evaluate('*[@id="mw-content-text"]/table[1]/tbody/tr/td[2]/table', lyrUrl, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		$("#lyricsCanvas").append(e);
		

	} ).fail(function() {
			console.log("No info found");
			$("#lyricsCanvas").html("No info found")
		});	
}

