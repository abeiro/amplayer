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

	// Cache stats
	this.cacheCounter=new Object();
	this.cacheCounter.miss=0;
	this.cacheCounter.hit=0;

	// Main request
	var request = $.ajax({
		url: DURL,
		type: "GET",
		dataType: "text"
	});
	request.done(function (rawdata) {
		xml = xml2array($.parseXML(rawdata));
		_this._authkey = xml.root.auth;
		_this._nsongs = xml.root.songs;
		_this._getSongs();
	});
}

/*** 
Get all songs.

*/
AMPACHE.prototype._getSongs = function (cmd, ret) {
	var _this = this;
	_getCachedData("songs", this.URL + "?" + "action=songs" + "&auth=" + this._authkey, function (edata) {
		_this._songs = edata;
		loadPlayList();
		_this._getPlayLists();
	});
}

/*** 
Get playlists
*/
AMPACHE.prototype._getPlayLists = function () {
	var _this = this;
	_getCachedDataXML("songs", this.URL + "?" + "action=playlists" + "&auth=" + this._authkey, function (edata) {
		_this._playlists = edata.children[0].children;
		
		pl=new Array();
		pl[0]="-";
		for (i=0;i<_this._playlists.length;i++) {
			pl[_this._playlists[i].attributes[0].value]="List: "+_this._playlists[i].children[0].textContent;

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
AMPACHE.prototype._loadPlayList = function (plid) {
	var _this = this;
	_getCachedData("songs", this.URL + "?" + "action=playlist_songs&filter="+plid + "&auth=" + this._authkey, function (data) {
		_this._songs = data;
		loadPlayList();
	});
}

AMPACHE.prototype.createObjectURL = function (file) {
	if (window.webkitURL) {
		return window.webkitURL.createObjectURL(file);
	} else if (window.URL && window.URL.createObjectURL) {
		return window.URL.createObjectURL(file);
	} else {
		return null;
	}
}


AMPACHE.prototype.loadImageCached = function (resource, ele) {
	cKey = "i_" + CryptoJS.SHA256(resource).toString();
	var _this = this;
	//$("#"+ele.id).fadeOut()
	var cacheWorked = false;
	CustomStorage.getVar(cKey, function (varO) {
		console.log("Searching for cached: "+cKey);
		if ((varO != undefined) && (varO[cKey])) {
			console.log("Using cached version: " + cKey + " " + resource);
			ele.src = (varO[cKey]);
			ele.onerror = function (e) {
				console.log("Cache was invalid:" + cKey);
				CustomStorage.delVar(cKey);
				_this.loadImageCached(resource, ele);
				_this.cacheCounter.miss++;
			};
			ele.onload = function (e) {
				_this.cacheCounter.hit++;
				//$("#"+this.id).fadeIn();
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
					var xhr = new XMLHttpRequest();
					xhr.open('GET', resource, true);
					xhr.responseType = 'blob';
					xhr.onload = function (e) {
						ele.src = _this.createObjectURL(this.response);
						//ele.onload=function() {$("#"+this.id).fadeIn()}
						CustomStorage.setVar(cKey, ele.src,function (e) {});
					};
					xhr.send();
				}
			}
		}
	});
}



AMPACHE.prototype.loadImage = function (resource, ele) {
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
	
	currentSong = songnumber;
	
	_("ampacheplayer").src = this._songs.root.song[songnumber].url;
	_("ampacheplayer").load();
	_("title").innerHTML = this._songs.root.song[songnumber].title;
	_("artist").innerHTML = this._songs.root.song[songnumber].artist;
	_("album").innerHTML = this._songs.root.song[songnumber].album;
	
	$("#cLike").get(0).style.backgroundColor="transparent";

	this.loadImageCached(this._songs.root.song[songnumber].art, _("art"));
	
	document.title = currentSong + " " + this._songs.root.song[songnumber].title + "::" + this._songs.root.song[songnumber].artist;
	
	changeFavicon(this._songs.root.song[songnumber].art);
	
	showPopup(this._songs.root.song[songnumber].art, this._songs.root.song[songnumber].title, this._songs.root.song[songnumber].artist + " :: " + this._songs.root.song[songnumber].album);
	
	this.loadArt(this._songs.root.song[songnumber].mbid);
	
	markSong(currentSong);

	console.log("Cache: "+conn.cacheCounter.miss+ " misses "+conn.cacheCounter.hit+" hits ");
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
		$('#art').toggle();
	} else {
		_('playerCanvas').style.opacity = 0.75;
		_('playerCanvas').style.position = "absolute";
		_('playerCanvas').style.top = "";
		_('playerCanvas').style.bottom = "0px";
		$('#art').toggle();
	}
}


AMPACHE.prototype.loadArt = function (song_mbid) {
	_this = this;
	_this.loadImage("img/defaultbg.png", _("showCanvasImg"));
	if (!useFanArt) {
		console.log("User fan art is disabled");
		return;
	}
	CustomStorage.getVar("cache_" + song_mbid, function (varO) {
		if (varO["cache_" + song_mbid]) {
			console.log("Loading cache XML api.fanart.tv:" + song_mbid);
			dataSong = varO["cache_" + song_mbid];
			try {
				a = dataSong[Object.keys(dataSong)[0]].artistbackground;
				rndIndex = Math.floor((Math.random() * a.length));
				console.log("Fan art images: " + a.length);
				img = dataSong[Object.keys(dataSong)[0]].artistbackground[rndIndex].url;
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
					$.getJSON("http://api.fanart.tv/webservice/artist/" + FANARTAPIKEY + "/" + dataSong["artist-credit"][0].artist.id + "/JSON/artistbackground",
						function (dataSong) {
							CustomStorage.setVar("cache_" + song_mbid, dataSong,function (e) {console.log(e)});
							try {
								a = dataSong[Object.keys(dataSong)[0]].artistbackground;
								rndIndex = Math.floor((Math.random() * a.length));
								img = dataSong[Object.keys(dataSong)[0]].artistbackground[rndIndex].url;
								_this._songs.root.song[currentSong].fanart=dataSong[Object.keys(dataSong)[0]].artistbackground[rndIndex].url;
								_this.loadImageCached(img, _("showCanvasImg"));
							} catch (imgNotAvailable) {
								console.log("Image not available for"+song_mbid);
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
AMPACHE.prototype.loadArtCover = function (dataSong, _counter, song_mbid) {
	_this = this;
	_counterMax = dataSong.releases.length;
	try {
		$.getJSON("http://coverartarchive.org/release/" + dataSong.releases[_counter].id, function (dataAlbum) {
			console.log("Images");
			console.log(dataAlbum);
			img = dataAlbum.images[0].image;
			_this.loadImage(img, _("showCanvasImg"));
			CustomStorage.setVar(song_mbid, img, function (e) {
				console.log(e)
			});
		}).fail(function () {
			_counter--;
			if (_counter < 0) {
				console.log("Unable to get art");
				_this.loadImage("img/defaultbg.png", _("showCanvasImg"));
			} else {
				_this.loadArtCover(dataSong, _counter, song_mbid);
			}
		});
	} catch (idontcare) {
		console.log("Unable to get art." + idontcare);
	}
}

function markSong(i) {
	try {
		$("#playlist tr").each(function (index) {
			this.style.textDecoration = "none";
		});
		_("s" + i).parentNode.parentNode.style.textDecoration = "underline";
	} catch (idontcare) {
		console.log(idontcare);
	}
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
		console.log("Error");
		console.log(e);
		_("title").innerHTML = "Error";
		_("artist").innerHTML = "Connection lost";
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
	});

	_("cShow").addEventListener("click", function () {
		conn.toogleShowMan()
	});

	_("publishonfacebook").addEventListener("click", function () {
		InitFB();
	});


	_("fullScreenButton").addEventListener("click", function () {
		if (!this.isFullScreen) {
			var el = document.documentElement
			, rfs =
				el.requestFullScreen
				|| el.webkitRequestFullScreen
				|| el.mozRequestFullScreen
				rfs.call(el);
	
				this.isFullScreen=true;s
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
		if (window.innerWidth > window.innerHeight) {
			_('showCanvasImg').style.width = window.innerWidth  + "px";
		} else {
			_('showCanvasImg').style.height = window.innerHeight + "px";
		}
	}, false);

	window.addEventListener(orientationEvent, function () {
		_('playlistContent').style.width = (window.innerWidth - 15) + "px";
		if (window.innerWidth > window.innerHeight) {
			_('showCanvasImg').style.width = window.innerWidth  + "px";
		} else {
			_('showCanvasImg').style.height = window.innerHeight  + "px";
		}
	}, false);

	window.addEventListener("resize", function () {
		_('playlistContent').style.width = (window.innerWidth - 15) + "px";
		if (window.innerWidth > window.innerHeight) {
			_('showCanvasImg').style.height = window.innerHeight  + "px";
			_('showCanvasImg').style.width = window.innerWidth  + "px";
		} else {
			_('showCanvasImg').style.height = window.innerHeight  + "px";
			_('showCanvasImg').style.width = "auto";
		}
	}, false);


	_("title").innerHTML = "AMPlayer";
	_("artist").innerHTML = "Welcome!";
	$('#showCanvas').toggle();

	
	

	if ((browserApi != false)) {
		try {
			/* Tracker */
			service = analytics.getService('Ampache Player');
			service.getConfig().addCallback(function (config) {
				config.setTrackingPermitted(true)
			});
			// Get a Tracker using your Google Analytics app Tracking ID.
			tracker = service.getTracker('UA-43775693-1');
			// Record an "appView" each time the user launches your app or goes to a new
			// screen within the app.
			tracker.sendAppView('MainView');
			//currentSong=Math.floor((Math.random()*conn._nsongs)+1)-1;
		} catch (fucktracker) {
			console.log("Tracker disabled");
		}
	}
}
