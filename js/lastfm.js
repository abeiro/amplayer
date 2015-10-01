/********************************************************************************************
Copyright 2012 Augusto Beiro
This file is part of Foobar.
Foobar is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the 
Free Software Foundation, either version 3 of the License, 
or (at your option) any later version.
Ampache Player is distributed in the hope that it will be useful, 
but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or 
FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with Ampache Player. 
If not, see http://www.gnu.org/licenses/.
/********************************************************************************************/





function LASTFM() {
	this.LASTFM_API_KEY='eb02a6ef37fdf208dee289eac9e00ed3';
	this.LASTFM_API_SECRET="660b4b108d02fc3d95c09d95348a0655"
	this.LASTFMURL="http://ws.audioscrobbler.com/2.0/?method=";
	this.LASTFM_URLWS="http://ws.audioscrobbler.com/2.0/?";

	this.TOKEN="";
	this.SKTOKEN="";
	this.isCONNECTED=false;

	_lfm=this;

	CustomStorage.getVar("lastfm_token", function (e) {
		if (e.lastfm_token==null) {
	
			$.get(_lfm.LASTFMURL+"auth.gettoken&api_key="+_lfm.LASTFM_API_KEY+"&format=json",null,
				function (data) { 
					_lfm.TOKEN=data.token
					_lfm.autorize();
					/*_lfm.authCheck=setInterval(function(){ 
						_lfm.auth();
					}, 30000);*/

			});
		} else {
			_lfm.isCONNECTED=true;
			_lfm.SKTOKEN=e.lastfm_token;
			_("cLastFM").style.opacity=1
			conn.prehooks[conn.prehooks.length] =
				function (song) {
					if (LFM.isCONNECTED) {
						$("#myCanvas").fadeOut();
					}
				}

			 conn.hooks =[].concat( 
				function (song) {
					console.log("Hook:"+song);
					if (LFM.isCONNECTED) {
						LFM.scrobble(conn._songs.root.song[currentSong])
						LFM.updateTags(conn._songs.root.song[currentSong])
						$("#cLastFM").animateRotate(360, {
						  duration: 1000,
						  easing: 'linear',
						  complete: function () {},
						  step: function () {}
						});


					}
				}	
			);
		}
	})
}


LASTFM.prototype.autorize=function() {
	_lfm=this;
	if (browserApi) {
		chrome.app.window.create("webview.html",{id:'lastfmwindow'},function() {
			lastfmwindow=chrome.app.window.get("lastfmwindow")
			lastfmwindow.contentWindow.main=function() {
				wv=lastfmwindow.contentWindow.document.getElementById('webwindow')
				lastfmwindow.contentWindow.document.title="Allow App in LAST.FM, then close this window";
				wv.src="http://www.last.fm/api/auth/?api_key="+_lfm.LASTFM_API_KEY+"&token="+_lfm.TOKEN
	
				lastfmwindow.onClosed.addListener(function (e) {
					console.log(e)
					_lfm.auth();
				})
			}
	
		})
	
		chrome.app.window.onClosed.addListener(function (e) {
			console.log(e)
			_lfm.auth();
		});
	} else {
		var ref = window.open("http://www.last.fm/api/auth/?api_key="+_lfm.LASTFM_API_KEY+"&token="+_lfm.TOKEN, '_blank', 'location=yes');
		ref.addEventListener("exit", 
			function() {
				_lfm.auth();
			
			}
		);
		
		
	}
	//$('#webwindow').attr('src',"http://www.last.fm/api/auth/?api_key="+_lfm.LASTFM_API_KEY+"&token="+_lfm.TOKEN )
	//$('#webviewer').fadeIn();
	//window.open("http://www.last.fm/api/auth/?api_key="+_lfm.LASTFM_API_KEY+"&token="+_lfm.TOKEN,"lastfm","",true);

}

LASTFM.prototype.auth=function() {
	_lfm=this;
	SIGNATURE=md5("api_key"+_lfm.LASTFM_API_KEY+"methodauth.getSessiontoken"+_lfm.TOKEN+_lfm.LASTFM_API_SECRET)
	$.get(_lfm.LASTFMURL+"auth.getSession&api_key="+_lfm.LASTFM_API_KEY+"&token="+_lfm.TOKEN+"&format=json&api_sig="+SIGNATURE,null,
		function (data) { 
			clearInterval(_lfm.authCheck)
			console.log(data) 
			_lfm.SKTOKEN=data.session.key
			_lfm.username=data.session.name
			_lfm.isCONNECTED=true;
			_("cLastFM").style.opacity=1
			 CustomStorage.setVar("lastfm_token",data.session.key, function (e)  {});
			 conn.prehooks[conn.prehooks.length] =
				function (song) {
					if (LFM.isCONNECTED) {
						$("#myCanvas").fadeOut();
					}
				}
				
			 conn.hooks =[].concat( 
				function (song) {
					console.log("Hook:"+song);
					if (LFM.isCONNECTED) {
						LFM.scrobble(conn._songs.root.song[currentSong])
						LFM.updateTags(conn._songs.root.song[currentSong])
						$("#cLastFM").animateRotate(360, {
						  duration: 1000,
						  easing: 'linear',
						  complete: function () {},
						  step: function () {}
						});
					}
				}	
			);
		}
	)
}

LASTFM.prototype.scrobble=function(song) {
	_lfm=this;
	request=_lfm.buildRequest("track.scrobble","&mbid="+song.mbid+"&artist="+encodeURIComponent(song.artist)+"&track="+encodeURIComponent(song.title)+"&timestamp="+(Math.floor(new Date().getTime()/1000)-60));

	$.post(_lfm.LASTFM_URLWS,request,
		function (data) { 
			console.log(data) 
			
		}
	)
}

LASTFM.prototype.buildRequest=function(wmethod,parms) {
	_lfm=this;
	common="api_key="+_lfm.LASTFM_API_KEY+"&method="+wmethod+"&sk="+_lfm.SKTOKEN;
	common+=parms;
	O=getQueryParams(common);
	keys = Object.keys(O);
	keys.sort();
	finalUrl="";
	rawSign="";
	for (i in keys) {
		finalUrl+=keys[i]+"="+O[keys[i]]+"&";
		rawSign+=keys[i]+O[keys[i]];
		console.log(keys[i]+"="+O[keys[i]]+"&");
	}

	finalUrl=finalUrl.substring(0, finalUrl.length - 1);
	SIGNATURE=md5(rawSign+_lfm.LASTFM_API_SECRET)
	return finalUrl+"&api_sig="+SIGNATURE;
}

LASTFM.prototype.updateTags=function(song) {
	_lfm=this;
	$.get(_lfm.LASTFM_URLWS+_lfm.buildRequest("artist.gettoptags","&mbid="+song.artist_mbid)+"&format=json",
	function (e) { 
		console.log(e) 
		buffer=""

		for (i in e.toptags.tag) {
			buffer+='<a href=""" weight="'+Math.floor(e.toptags.tag[i].count/2)+'">'+ e.toptags.tag[i].name+'</a>'
			if ((i>20)||(Math.floor(e.toptags.tag[i].count/2)<10))
				break;
		}
		newcolor=getAverageRGB(_("showCanvasImg"));
		console.log(newcolor);
		
		$("#tags").html(buffer)
		$("#tags a").attr("style","color:"+newcolor)
		
		$('#myCanvas').tagcanvas("reload")
		$('#myCanvas').tagcanvas("setspeed", [0.15, -0.125])


		$("#myCanvas").fadeIn();

		/*$.get(_lfm.LASTFM_URLWS+_lfm.buildRequest("artist.getinfo","&mbid="+song.artist_mbid)+"&format=json",
		function (e) {
			for (i in e.artist.image) {
				if (e.artist.image[i].size=="medium") {
					$("#tags").append("<a weight='100'><img id='tag"+i+"' style=''></a>")
					conn.loadImageCached(e.artist.image[i]["#text"],_("tag"+i))
					_("tag"+i).style.display="block";
				}
			}
			setTimeout(function() {$('#myCanvas').tagcanvas("reload")},3000);
		});*/
	} 
	)
}

/*LFM=new LASTFM();
LFM.autorize();*/

function getAverageRGB(imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return "rgb("+(rgb.r|128)+","+(rgb.g|128)+","+(rgb.b|128)+")";

}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

function _fm_AlbumGetInfo() {

	cSong=conn._songs.root.song[currentSong];

	var request = $.ajax({
        url : conn.URL + "?" + "action=albums&exact=true&filter="+cSong.album + "&auth=" + conn._authkey, 
		type : "GET", 
		dataType : "xml" 
    });
    request.done(function (rawdata) 
    {
		
		artist=rawdata.getElementsByTagName("artist")[0].textContent;
		album=rawdata.getElementsByTagName("name")[0].textContent;
		console.log(artist+" "+album);
		//http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=eb02a6ef37fdf208dee289eac9e00ed3&artist=Cher&album=Believe&format=json

		$.getJSON(LASTFMURL+"album.getinfo&api_key="+APIKEY+"&artist="+artist+"&album="+album+"&format=json" , function(e) {
				console.log( "success"  );
				console.log( e );
				
				;
				conn.loadImageCached(e.album.image[e.album.image.length-1]["#text"],_("showCanvasImg"));
			})

	});


}


