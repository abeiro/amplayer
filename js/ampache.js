/********************************************************************************************
Copyright 2013 Augusto Beiro
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

function _(id) {
	return document.getElementById(id)
}

function AMPACHE(admin, pass, url) {
	this.loadImage("img/loading.gif", _("art"));
	this._user = admin;
	this._pass = pass;
	//this._time = 
	var _time = Math.round((new Date()).getTime() / 1000);
	var _key = CryptoJS.SHA256(this._pass);
	this._passphrase = CryptoJS.SHA256(_time + "" + _key);
	this.URL = url + "/server/xml.server.php";
	var DURL = this.URL + "?action=handshake&auth=" + this._passphrase + "&timestamp=" + _time + "&version=350001&user=" + this._user;
	var _this = this;
	this.hooks=new Array();
	this.prehooks=new Array();

	// Cache stats
	this.cacheCounter=new Object();
	this.cacheCounter.miss=0;
	this.cacheCounter.hit=0;

	// Main request
	_("title").innerHTML = "Connecting...";
	var request = $.ajax({
		url: DURL,
		type: "GET",
		dataType: "text"
	});
	request.done(function (rawdata) {
		if (rawdata=="") {
		_("title").innerHTML = "Empty reponse. Maybe user/password are invalid";
		} else {
			xml = xml2array($.parseXML(rawdata));
			_this._authkey = xml.root.auth;
			_this._nsongs = xml.root.songs;
			_this._getSongs();
			_("title").innerHTML = "Ready to play!";
		}
	});


	request.fail(function (rawdata) {
		console.log(rawdata);
		_("title").innerHTML = "Connection error: " +rawdata.statusText

	});
}

/*** 
Get all songs.

*/
AMPACHE.prototype._getSongs = function (cmd, ret) {
	var _this = this;
	_getCachedDataNew("songs", this.URL + "?" + "action=songs" + "&auth=" + this._authkey, function (edata) {
		_this._songs = edata;
		loadPlayList();
		_this._getPlayLists();
	});
}

/*** 
Ping (to keep connection alive)

*/
AMPACHE.prototype._ping = function () {
	var _this = this;
	
	$.get(this.URL + "?" + "action=ping" + "&auth=" + this._authkey+"&user="+this._user, function (edata) {
		console.log(edata.childNodes[0].childNodes[3].childNodes[0].textContent);
	},"xml");
}

/*** 
Get playlists
*/
AMPACHE.prototype._getPlayLists = function () {
	var _this = this;
	_getCachedDataXML("songs", this.URL + "?" + "action=playlists" + "&auth=" + this._authkey, function (edata) {
		_this._playlists = edata.childNodes[0].childNodes;
		
		pl=new Array();
		pl[0]="-";
		for (i=0;i<_this._playlists.length;i++) {
			if (_this._playlists[i].nodeName!="#text")
				pl[_this._playlists[i].getAttribute("id")]="List: "+_this._playlists[i].childNodes[1].childNodes[0].textContent;

		}
		changeListModel(_('playlistselect'),pl);

		_('playlistselect').onchange=function (e) {
			if (_('playlistselect').value==0)
				_this._getSongs();
			else
				_this._loadPlayList(_('playlistselect').value);

		}
	});
}


/*** 
Get playlists
*/
AMPACHE.prototype.vote = function () {
	var _this = this;
	oid=this._songs.root.song[currentSong].id
	var request = $.ajax({
        url : this.URL + "?" + "action=democratic&method=vote&oid="+oid + "&auth=" + this._authkey, type : "GET", dataType : "xml" 
    });
    
}

/*** 
Get playlists
*/
AMPACHE.prototype._loadPlayList = function (plid) {
	var _this = this;
	_getCachedData("songs", this.URL + "?" + "action=playlist_songs&filter="+plid + "&auth=" + this._authkey, function (data) {
		_this._songs = data;
		c=0;
		for (i in _this._songs.root.song) c++;
		_this._nsongs =c;
		loadPlayList();
	});
}

AMPACHE.prototype.createObjectURL = function (file) {
	if (window.URL) {
		return window.URL.createObjectURL(file);
	} else if (window.URL && window.URL.createObjectURL) {
		return window.URL.createObjectURL(file);
	} else {
		return null;
	}
}


AMPACHE.prototype.loadImageCached = function (resource, ele) {
	if (resource=="img/defaultbg.png") {
		ele.src=resource;
		return;
	}
	var cKey = "i_" + CryptoJS.SHA256(resource).toString();
	var _this = this;
	if (browserApi)
		$("#"+ele.id).hide() 
	var cacheWorked = false;
	CustomStorage.getVar(cKey, function (varO) {
		console.log("Searching for cached: "+cKey);
		if ((varO != undefined) && (varO[cKey])) {
			console.log("Using cached version: " +ele.id+":"+ cKey + " " + resource);
			ele.src = (varO[cKey]);
			ele.onerror = function (e) {
				console.log("Cache was invalid:" + cKey);
				CustomStorage.delVar(cKey);
				_this.loadImageCached(resource, ele);
				_this.cacheCounter.miss++;
			};
			ele.onload = function (e) {
				_this.cacheCounter.hit++;
				$("#"+this.id).fadeIn();

			}
			cacheWorked = true;
		}
		if (!cacheWorked) {
			console.log("Using real version: " + cKey + " " + resource);
			_this.cacheCounter.miss++;
			if (browserApi == false) {
				ele.src = resource;
			} else {
				if (typeof app != 'undefined') // android app // android app
					ele.src = resource;
				else {
					if (!gUseInternalProxy)
						resUrl=resource;
					else
						resUrl="proxy.php?url="+encodeURIComponent(resource);
					
					var xhr = new XMLHttpRequest();
					xhr.open('GET', resUrl, true);
					xhr.responseType = 'blob';
					xhr.onload = function (e) {
						ele.src = _this.createObjectURL(this.response);

						ele.onload=function() {$("#"+this.id).fadeIn();}

						CustomStorage.setVar(cKey, ele.src,function (e) {
							console.log("Caching for:"+ele.id+" "+cKey);
							CustomStorage.showUse(cKey);
							
						});
					};
					xhr.send();
				}
			}
		}
	});
}



AMPACHE.prototype.loadImage = function (resource, ele) {
	if (resource=="img/defaultbg.png") {
		ele.src=resource;
		console.log("Using def bg")
		return;
	}

	if (browserApi == false) {
		ele.src = resource;
	} else {
		if (typeof app != 'undefined') // android app
			ele.src = resource;
		else {
			var xhr = new XMLHttpRequest();
			var _this = this;
			xhr.open('GET', resource, true);
			xhr.responseType = 'blob';
			xhr.onload = function (e) {
				ele.src = _this.createObjectURL(this.response);
			};
			xhr.send();
		}
	}
}



AMPACHE.prototype.localplay = function (songnumber) {
	
	this.beforeplay();
	currentSong = songnumber;
	
	_("ampacheplayer").src = this._songs.root.song[songnumber].url;
	//console.log("Checking if browser can play this:"+_("ampacheplayer").canPlayType());

	_("ampacheplayer").load();
	_("title").innerHTML = this._songs.root.song[songnumber].title;
	_("artist").innerHTML = this._songs.root.song[songnumber].artist;
	_("album").innerHTML = this._songs.root.song[songnumber].album;
	
	$("#cLike").get(0).style.backgroundColor="transparent";

	this.loadImageCached(this._songs.root.song[songnumber].art, _("art"));
	
	document.title = currentSong + " " + this._songs.root.song[songnumber].title + "::" + this._songs.root.song[songnumber].artist;
	
	changeFavicon(this._songs.root.song[songnumber].art);
	
	this.loadArt(this._songs.root.song[songnumber].mbid);
	
	markSong(currentSong);

	$("#infoCanvas").hide();
	$("#lyricsCanvas").hide();
	try {
				showInfo();
	}  catch (idontcare) {}	
	
		if (gUseLyrics) {
			console.log("Fetching lyrics");
			try {
					extractLyrics();
			}	
			catch (idontcare) {}
		} else
			console.log("uselyrics is false");
	

	
	showPopup(this._songs.root.song[songnumber].art, this._songs.root.song[songnumber].title, this._songs.root.song[songnumber].artist + " :: " + this._songs.root.song[songnumber].album);
	console.log("Cache: "+this.cacheCounter.miss+ " misses "+this.cacheCounter.hit+" hits ");

	try {
		$("#nextTitle").html(" Next : "+
		this._songs.root.song[currentSong+1].title
		+" by "+this._songs.root.song[currentSong+1].artist+"");
	} catch (idontcare) {}

	
	setTimeout(function(){ conn.afterplay() }, 5000);
	


	
	//showPopup(_("art").src, this._songs.root.song[songnumber].title, this._songs.root.song[songnumber].artist + " :: " + this._songs.root.song[songnumber].album);
}

AMPACHE.prototype.beforeplay=function () {
	if (Array.isArray(this.prehooks) ) {
		
		for (i in this.prehooks) 
			this.prehooks[i](this._songs.root.song[currentSong-1]) 
	}
}

AMPACHE.prototype.afterplay=function () {
	if (Array.isArray(this.hooks) ) {
		
		for (i in this.hooks) 
			this.hooks[i](this._songs.root.song[currentSong]) 
	}
}


AMPACHE.prototype.nextSong = function () {
	currentSong++;
	if (currentSong >= this._nsongs) {
		currentSong = 0;
	}
	conn.localplay(currentSong);
}


AMPACHE.prototype.prevSong = function () {
	currentSong--;
	if (currentSong <= -1) {
		currentSong = this._nsongs - 1;
	}
	conn.localplay(currentSong);
}


AMPACHE.prototype.toogleShowMan = function () {
	$('#playlist').toggle();
	$('#playlistselect').toggle();
	$('#showCanvas').toggle();

	//this.loadImage(this._songs.root.song[currentSong].art,_("showCanvasImg"));
	_('showCanvasImg').style.height = window.innerHeight + "px";
	if (_('showCanvas').style.display == "none") {
		_('playerCanvas').style.opacity = 1;
		_('playerCanvas').style.top = "0px";
		_('playerCanvas').style.position = "relative";
		_('playerCanvas').style.bottom = "";
		_('art').style.left=""
		$('#art').show();

	} else {
		_('playerCanvas').style.opacity = 0.85;
		_('playerCanvas').style.position = "absolute";
		_('playerCanvas').style.top = "";
		_('playerCanvas').style.bottom = "0px";
		$('#art').hide();
		_('art').style.left="10000px"
		
	}
}


AMPACHE.prototype.loadArt = function (song_mbid) {
	_this = this;
	_this.loadImage("img/defaultbg.png", _("showCanvasImg"));
	if (!useFanArt) {
		console.log("Use fan art is disabled");
		return;
	}
	CustomStorage.getVar("cache_" + song_mbid, function (varO) {
		if (varO["cache_" + song_mbid]) {
			console.log("Loading cache XML api.fanart.tv:" + song_mbid);
			dataSong = varO["cache_" + song_mbid];
			try {
				a = dataSong[Object.keys(dataSong)[0]].artistbackground;
				if (a.length>1) {
					rndIndex = Math.floor((Math.random() * a.length));
					while (_("showCanvasImg").realsource==dataSong[Object.keys(dataSong)[0]].artistbackground[rndIndex].url) {
						console.log("Same fanart, retrying"+_("showCanvasImg"));
						rndIndex = Math.floor((Math.random() * a.length));
					}
				} else
					rndIndex=0;

				console.log("Fan art images: " + a.length);
				img = dataSong[Object.keys(dataSong)[0]].artistbackground[rndIndex].url;
				_("showCanvasImg").realsource=img;
				_this.loadImageCached(img, _("showCanvasImg"));

			} catch (imgNotAvailable) {
				console.log("XML cache was invalid:" + song_mbid);
				CustomStorage.delVar("cache_" + song_mbid);
				_this.loadArt(song_mbid);
				return;
				//_this.loadImage("img/defaultbg.png", _("showCanvasImg"));
			}
			//_this.loadImage(varO[song_mbid], _("showCanvasImg"));
			
		} else {
			console.log("Loading :" + song_mbid);
			$.getJSON("http://musicbrainz.org/ws/2/recording/" + song_mbid + "?inc=artist-credits+isrcs+releases&fmt=json",
				function (dataSong) {
					console.log(dataSong.releases);
					if (!gUseInternalProxy)
						fanUrl="http://webservice.fanart.tv/v3/music/" + dataSong["artist-credit"][0].artist.id + "?api_key=" + FANARTAPIKEY + ""
					else
						fanUrl="proxy.php?url="+encodeURIComponent("http://api.fanart.tv/webservice/artist/" + FANARTAPIKEY + "/" + dataSong["artist-credit"][0].artist.id + "/JSON/artistbackground");
                                        
					$.getJSON(fanUrl,
						function (dataSong) {
							CustomStorage.setVar("cache_" + song_mbid, dataSong,function (e) {console.log(e)});
							try {
								a = dataSong.artistbackground;
								if (a.length>1) {
									rndIndex = Math.floor((Math.random() * a.length));
									while (_("showCanvasImg").realsource==dataSong.artistbackground[rndIndex].url) {
										console.log("Same faart, retrying"+_("showCanvasImg").realsource);
										rndIndex = Math.floor((Math.random() * a.length));
									}
								} else
									rndIndex=0;
								
								_("showCanvasImg").realsource=dataSong.artistbackground[rndIndex].url;
								img = dataSong.artistbackground[rndIndex].url;
								_this._songs.root.song[currentSong].fanart=dataSong.artistbackground[rndIndex].url;
								_this.loadImageCached(img, _("showCanvasImg"));
							} catch (imgNotAvailable) {
								console.log("Image not available for: "+song_mbid);
								_this.loadImage("img/defaultbg.png", _("showCanvasImg"));
							}
						});
					//_this.loadArtCover(dataSong, dataSong.releases.length - 1, song_mbid);
				}).fail(function () {
				console.log("Unable to get info for: " + song_mbid);
				_this.loadImage("img/defaultbg.png", _("showCanvasImg"));
			});
		}
	});
}



function markSong(i) {
	try {
		$("#playlist tr").each(function (index) {
			this.style.textDecoration = "none";
		});
		_("s" + i).parentNode.parentNode.style.textDecoration = "underline";
	} catch (idontcare) {
		//console.log(idontcare);
	}
}


function disposeElements() {
    
    
      /* Make this something responsive */
        
        xDpi=window.innerWidth/1024;
        yDpi=window.innerHeight/720;
        
        aZoom=(yDpi<xDpi)?yDpi:xDpi;
        
        console.log("Reshaping..."+aZoom);
        
        _("playerCanvas").style.zoom=aZoom;
        _("lyricsCanvas").style.zoom=aZoom;
        _("settings").style.zoom=aZoom;
        
        
        
        
	if (window.innerWidth > window.innerHeight) {
		_('showCanvasImg').style.width = "100%";
                _('showCanvasImg').style.height = "100%";
	} else {
		_('showCanvasImg').style.height = "100%";
                _('showCanvasImg').style.width = "100%";
	}
	try {
            _('playlistContent').style.width = (window.innerWidth - 5) + "px";
            
        } catch (idontcare) {}

        $('#myCanvas').tagcanvas({
          					textColour: '#ffffff',
          					outlineColour: '#ffffff',
          					reverse: true,
          					depth: 0.2,
          					maxSpeed: 0.05,
          					weight:true,
          					weightFrom:'weight',textColour: null
        				},'tags')
     
}


var conn;
var currentSong;

/* 
INITIALIZATION 
*/

if (typeof app != 'undefined')
	document.addEventListener("deviceready", initSystem, false);
else {
	$(document).ready(function () {
		initSystem();
	});
}


function initSystem() {
    
      
        
	/* Add event listeners */
	_("cPrev").onclick = function () {
		conn.prevSong()
	}
	_("cNext").onclick = function () {
		conn.nextSong()
	}
	_("cSettings").onclick = function () {
		showSettings()
	}
	_("ampacheplayer").addEventListener("ended", function () {
		
		conn.nextSong()
	});

	_("ampacheplayer").addEventListener("canplay", function () {
		_("ampacheplayer").play()
	});

	_("ampacheplayer").addEventListener("error", function (e) {
		console.log("Error: "+e);
		err=e.target.error;;
		if (err.code==err.MEDIA_ERR_ABORTED) {
			console.log("MEDIA_ERR_ABORTED");
			errMsg="MEDIA_ERR_ABORTED";
		}
		if (err.code==err.MEDIA_ERR_NETWORK) {
			console.log("MEDIA_ERR_NETWORK");
			errMsg="MEDIA_ERR_NETWORK";
		}
		if (err.code==err.MEDIA_ERR_DECODE) {
			console.log("MEDIA_ERR_DECODE");
			errMsg="MEDIA_ERR_DECODE";
		}
		if (err.code==err.MEDIA_ERR_SRC_NOT_SUPPORTED) {
			console.log("MEDIA_ERR_SRC_NOT_SUPPORTED: "+e.target.src);
			errMsg="MEDIA_ERR_SRC_NOT_SUPPORTED";
		}

		_("title").innerHTML = "Error";
		_("artist").innerHTML = errMsg;
		_("album").innerHTML = "Maybe session has expired. Reload";
	});
	_("cRandomPl").addEventListener("click", function () {
		randomizePL()
	});
	
	_("cReload").addEventListener("click", function () {
		loadPreferences();
	});

	_("cLike").addEventListener("click", function () {
		publishOnFaceBook();
		conn.vote();
	});

	_("cShow").addEventListener("click", function () {
		conn.toogleShowMan()
	});

	_("cLyrics").addEventListener("click", function () {
		
		$("#lyricsCanvas").toggle();
	});
	
	_("cInfo").addEventListener("click", function () {
		
		$("#infoCanvas").toggle();

	});
	
	_("cLastFM").addEventListener("click", function () {
		
		LFM=new LASTFM();

	});
	
	_("cLastFM").style.opacity=0.5;
	
	_("fullScreenButton").addEventListener("click", function () {
		if (!this.isFullScreen) {
			var el = document.documentElement
			, rfs =
				el.requestFullScreen
				|| el.webkitRequestFullScreen
				|| el.mozRequestFullScreen
				rfs.call(el);
	
				this.isFullScreen=true;
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
			else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
			this.isFullScreen=false;
		}
		
	});

	// Load preferences
	loadPreferences();
	var supportsOrientationChange = "onorientationchange" in window,
		orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
	

	window.addEventListener(orientationEvent, function () {
		disposeElements()
	}, false);



	window.addEventListener(orientationEvent, function () {
		disposeElements()
	}, false);

	window.addEventListener("resize", function () {
		disposeElements()
	}, false);


	_("title").innerHTML = "AMPlayer";
	_("artist").innerHTML = "Welcome!";
	$('#showCanvas').toggle();

	window.setInterval(function() {conn._ping()},1000*600);

	$('#myCanvas').tagcanvas({
          					textColour: '#ffffff',
          					outlineColour: '#ffffff',
          					reverse: true,
          					depth: 0.2,
          					maxSpeed: 0.05,
          					weight:true,
          					weightFrom:'weight',textColour: null
        				},'tags')
     
  		
	disposeElements();

		
			

                
}
