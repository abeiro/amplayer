 

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

function getElementByXpath(path,from) {
  return document.evaluate(path, from, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

function getBandInfo(iCallBack) {
	////*[@id="mw-content-text"]/table[1]/tbody/tr/td[2]/table
	superstring="";
	$("#infoCanvasReal").html(superstring)
	re=/(&#[0-9]{1,4};)/gm;

	lyrUrl="https://musicbrainz.org/ws/2/artist/"+conn._songs.root.song[currentSong].artist_mbid+"?inc=url-rels&fmt=json";

	if (gUseInternalProxy)
		lyrUrl="proxy.php?url="+encodeURIComponent(lyrUrl);


	$.get(lyrUrl,function (e) {
		iCallBack(e);

	} ).fail(function() {
			console.log("No info found");
			$("#infoCanvasReal").html("No info found")
			
		});	
}


function showInfo() {
	getBandInfo(function (data) {
		console.log("Callback showInfo:"+data);
		buffer="";
		$("#infoCanvasReal").hide();
		$("#infoCanvasReal").html('');
		for (i in data.relations) { 
			//console.log(data.relations[i]);
			item=data.relations[i];
			buffer+="<li class='"+item.type+"-favicon'><a target='_blank' title='"+item.url.resource+"' href='"+item.url.resource+"'> "+item.type+" </a></li>";
			if (item.type=="wikipedia")
				wikUrl=item.url.resource;
		} 
		
		console.log(wikUrl);
		if (wikUrl) {
			/*var info = WIKIPEDIA.getData((wikUrl),function(e) { 
					console.log(e.summary);
					$("#infoCanvasReal").append("<p>"+e.summary.description+"</p>");
					$("#infoCanvasReal").append("<br clear='all'/><p>More info in : </p>"+buffer);
					conn.loadImageCached(e.summary.images[1],_("infoCanvasImg"));
					$("#infoCanvasReal").fadeIn();
					ab=$("#infoCanvasReal").html()
					nab=ab.replace(/\n/g,".<br /><br />")
					$("#infoCanvasReal").html(nab)

			});*/
			var re = /http[s]{0,1}:\/\/en\.wikipedia\.org\/wiki\//; 
			wikUrlShort=wikUrl.replace(re,"");
			//wikUrlShort=baseName(wikUrl);//BUG
			console.log("wikUrlShort: "+wikUrlShort);
			$.ajax({
	    		type: "GET",
	    		url: "http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page="+wikUrlShort,
	    		dataType: "json",
	    		success: function (data, textStatus, jqXHR) {
	    			var markup = data.parse.text["*"];
					var i = $('<div></div>').html(markup);
		
					// remove links as they will not work
					i.find('a').each(function() { $(this).replaceWith($(this).html()); });
					i.find('img').each(function() { $(this).replaceWith($(this).html()); });
					// remove any references
					i.find('sup').remove();
		
					// remove cite error
					i.find('.mw-ext-cite-error').remove();
		
					$('#infoCanvasReal').html($(i).find('p'));
					$("#infoCanvasReal").append("<p>More info in :</p> "+buffer);
					$("#infoCanvasReal").fadeIn();

				
	    		},
	    		error: function (errorMessage) {
	    			$('#infoCanvasReal').html('No wikipedia info for:'+wikUrlShort);
					$("#infoCanvasReal").append("<<p>More info in :</p> "+buffer);
					$("#infoCanvasReal").fadeIn();
	    		}
			});  
		}

	});
}

function baseName(str)
{
   var base = new String(str).substring(str.lastIndexOf('/') + 1); 
    if(base.lastIndexOf(".") != -1)       
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}


