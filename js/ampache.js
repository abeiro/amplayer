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
	var DURL = this.URL + "?action=handshake&auth=" + this._passphrase +
		"&timestamp=" + _time + "&version=350001&user=" + this._user;

	var _this = this;
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


AMPACHE.prototype._getSongs = function (cmd, ret) {
	var _this = this;
	_getCachedData("songs", this.URL + "?" + "action=songs" + "&auth=" + this._authkey,
		function (data) {
			_this._songs = data;
			loadPlayList();
		}
	);

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

	cKey="i_"+CryptoJS.SHA256(resource).toString();
	var _this = this;
	CustomStorage.getVar(cKey, function (varO) {
		//debugger;
		if ((varO!=undefined) &&(varO[cKey])) {
			consoleLog("Using cached version: "+cKey);
			ele.src = (varO[cKey]);
			
		}
		else {
			consoleLog("Using real version: "+cKey);
			if (browserApi == false)
				ele.src = resource;
			else {
				var xhr = new XMLHttpRequest();
				
				xhr.open('GET', resource, true);
				xhr.responseType = 'blob';
				xhr.onload = function (e) {
					ele.src = _this.createObjectURL(this.response);
					CustomStorage.setVar(cKey,ele.src);
				};
				xhr.send();
			}

		}
	});

}

AMPACHE.prototype.loadImage = function (resource, ele) {


	if (browserApi == false)
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

AMPACHE.prototype.localplay = function (songnumber) {

	currentSong = songnumber;

	_("ampacheplayer").src = this._songs.root.song[songnumber].url;
	_("ampacheplayer").load();
	_("title").innerHTML = this._songs.root.song[songnumber].title;
	_("artist").innerHTML = this._songs.root.song[songnumber].artist;
	_("album").innerHTML = this._songs.root.song[songnumber].album;


	this.loadImageCached(this._songs.root.song[songnumber].art, _("art"));

	document.title = currentSong + " " + this._songs.root.song[songnumber].title +
		"::" + this._songs.root.song[songnumber].artist;

	changeFavicon(this._songs.root.song[songnumber].art);

	showPopup(this._songs.root.song[songnumber].art, this._songs.root.song[
			songnumber].title, this._songs.root.song[songnumber].artist + " :: " + this._songs
		.root.song[songnumber].album)

	this.loadArt(this._songs.root.song[songnumber].mbid);

	markSong(currentSong);
}


AMPACHE.prototype.nextSong = function () {

	currentSong++;

	if (currentSong >= this._nsongs)
		currentSong = 0;
	conn.localplay(currentSong);


}

AMPACHE.prototype.prevSong = function () {

	currentSong--;
	if (currentSong <= -1)
		currentSong = this._nsongs - 1;
	conn.localplay(currentSong);

}


AMPACHE.prototype.toogleShowMan = function () {

	$('#playlist').toggle();
	$('#showCanvas').toggle();

	//this.loadImage(this._songs.root.song[currentSong].art,_("showCanvasImg"));
	_('showCanvasImg').style.height = window.innerHeight + "px";
	if (_('showCanvas').style.display == "none") {
		_('playerCanvas').style.opacity = 1;
		_('playerCanvas').style.top = "0px";
		_('playerCanvas').style.position="relative";
		_('playerCanvas').style.bottom = "";
		$('#art').toggle();
	} else {
		_('playerCanvas').style.opacity = 0.5;
		_('playerCanvas').style.position="absolute";
		_('playerCanvas').style.top = "";
		_('playerCanvas').style.bottom = "0px";
		$('#art').toggle();

	}

}

AMPACHE.prototype.loadArt = function (song_mbid) {
	_this = this;
	_this.loadImage("img/noart.jpg", _("showCanvasImg"));
	if (!useFanArt) {
		consoleLog("User fan art is disabled");
		return;
	}
	//http://api.fanart.tv/webservice/artist/3b604d4ff932c063108ac40c1a3af2c0/60a23fda-a440-4ab9-a344-7dfdd2ed341a/JSON/all/1/1/
	CustomStorage.getVar(song_mbid, function (varO) {

		if (varO[song_mbid]) {
			_this.loadImage(varO[song_mbid], _("showCanvasImg"));
			consoleLog("Loading cache:"+song_mbid);
		} else {
			consoleLog("Loading :"+song_mbid);
			$.getJSON("http://musicbrainz.org/ws/2/recording/" + song_mbid +
				"?inc=artist-credits+isrcs+releases&fmt=json",
				function (dataSong) {
					consoleLog(dataSong.releases);
					//consoleLog(dataSong["artist-credit"][0].artist.id);});
					$.getJSON("http://api.fanart.tv/webservice/artist/"+FANARTAPIKEY+"/"+dataSong["artist-credit"][0].artist.id+"/JSON/artistbackground",
					  function (dataSong) {
						//debugger;
					    //consoleLog(dataSong[Object.keys(dataSong)[0]].artistbackground);
						a=dataSong[Object.keys(dataSong)[0]].artistbackground;
					    try {
							rndIndex=Math.floor((Math.random()*a.length));
							img=dataSong[Object.keys(dataSong)[0]].artistbackground[rndIndex].url;
							_this.loadImageCached(img, _("showCanvasImg"));
						 }catch (imgNotAvailable) {
							debugger;
							_this.loadImage("img/noart.jpg", _("showCanvasImg"));

						}
					  });
					//_this.loadArtCover(dataSong, dataSong.releases.length - 1, song_mbid);

				}).fail(function () {
					consoleLog("Unable to get info for: " + song_mbid);
					_this.loadImage("img/noart.jpg", _("showCanvasImg"));
			});
		}
	});

}

AMPACHE.prototype.loadArtCover = function (dataSong, _counter, song_mbid) {
	_this = this;
	_counterMax = dataSong.releases.length;
	try {
		$.getJSON("http://coverartarchive.org/release/" + dataSong.releases[_counter]
			.id,
			function (dataAlbum) {
				consoleLog("Images");
				consoleLog(dataAlbum);
				img = dataAlbum.images[0].image;
				_this.loadImage(img, _("showCanvasImg"));
				CustomStorage.setVar(song_mbid, img, function (e) {
					consoleLog(e)
				});
			}
		).fail(function () {
			_counter--;
			if (_counter < 0) {
				consoleLog("Unable to get art");
				_this.loadImage("img/noart.jpg", _("showCanvasImg"));
			} else
				_this.loadArtCover(dataSong, _counter, song_mbid);
		});
	} catch (idontcare) {
		consoleLog("Unable to get art." + idontcare);
	}
}


function markSong(i) {
	try {

		$("#playlist tr").each(function (index) {
			this.style.textDecoration = "none";
		});
		_("s" + i).parentNode.parentNode.style.textDecoration = "underline";

	} catch (idontcare) {
		consoleLog(idontcare);
	}
}

var conn;
var currentSong;


/* 
INITIALIZATION 
*/
$(document).ready(function () {


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
		consoleLog("Error");
		consoleLog(e);
		_("title").innerHTML = "Error";
		_("artist").innerHTML = "Connection lost";
		_("album").innerHTML = "Maybe session has expired. Reload";
	});

	_("cRandomPl").addEventListener("click", function () {
		randomizePL()
	});
	_("cShow").addEventListener("click", function () {
		conn.toogleShowMan()
	});
	// Load preferences
	loadPreferences();

	var supportsOrientationChange = "onorientationchange" in window,
		orientationEvent = supportsOrientationChange ? "orientationchange" :
			"resize";


	window.addEventListener(orientationEvent, function () {
		if (window.innerWidth > window.innerHeight)
			_('showCanvasImg').style.width = window.innerWidth - 5 + "px";
		else
			_('showCanvasImg').style.height = window.innerHeight - 5 + "px";
	}, false);


	window.addEventListener(orientationEvent, function () {
		_('playlistContent').style.width = (window.innerWidth - 15) + "px";
		if (window.innerWidth > window.innerHeight)
			_('showCanvasImg').style.width = window.innerWidth - 5 + "px";
		else
			_('showCanvasImg').style.height = window.innerHeight - 5 + "px";
	}, false);

	window.addEventListener("resize", function () {
		_('playlistContent').style.width = (window.innerWidth - 15) + "px";
		if (window.innerWidth > window.innerHeight)
			_('showCanvasImg').style.width = window.innerWidth - 5 + "px";
		else
			_('showCanvasImg').style.height = window.innerHeight - 5 + "px";

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
			consoleLog("Tracker disabled");
		}
	}
});