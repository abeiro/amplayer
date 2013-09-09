 

// 

//rawdata= file_get_contents(URL);
//console.log(rawdata);

function _(id) {
  return document.getElementById(id)
}

function AMPACHE(admin, pass, url){

  this.loadImage("img/loading.gif",_("art"));
  this._user=admin;
  this._pass=pass;
  //this._time = 
  var _time=Math.round((new Date()).getTime() / 1000);
  var _key = CryptoJS.SHA256(this._pass);
  this._passphrase =  CryptoJS.SHA256(_time+""+_key); 
  this.URL=url+"/server/xml.server.php";
  var DURL=this.URL+"?action=handshake&auth="+this._passphrase+"&timestamp="+_time+"&version=350001&user="+this._user;
  
  var _this = this;
	var request = $.ajax({
	url: DURL,
	type: "GET",
	dataType: "text"
	});

	request.done(function(rawdata) {
		xml = xml2array($.parseXML(rawdata));
		_this._authkey=xml.root.auth;
		_this._nsongs=xml.root.songs;
		_this._getSongs();
	});
	
  // Initialize songs 
  
  
  
}

AMPACHE.prototype.send=function(cmd) {
  
  return getCachedData("songs",this.URL+"?"+cmd+"&auth="+this._authkey);
  
}

AMPACHE.prototype._getSongs=function(cmd,ret) {
   var _this = this;
  _getCachedData("songs",this.URL+"?"+"action=songs"+"&auth="+this._authkey,
	function(data) {
		_this._songs=data;
		loadPlayList();
	}
	);
  
}

AMPACHE.prototype.createObjectURL=function  ( file ) {
    if ( window.webkitURL ) {
        return window.webkitURL.createObjectURL( file );
    } else if ( window.URL && window.URL.createObjectURL ) {
        return window.URL.createObjectURL( file );
    } else {
        return null;
    }
}

AMPACHE.prototype.loadImage=function (resource,ele) {

	try {
		ele.src=resource;
	} catch (cap) {
		var xhr = new XMLHttpRequest();
		var _this=this;
		xhr.open('GET', resource, true);
		xhr.responseType = 'blob';
		xhr.onload = function(e) {
			ele.src = _this.createObjectURL(this.response);
		};
		xhr.send();
	}
}

AMPACHE.prototype.localplay=function(songnumber) {
  
  currentSong=songnumber;
  
  _("ampacheplayer").src=this._songs.root.song[songnumber].url;
  _("ampacheplayer").load();
  _("title").innerHTML=this._songs.root.song[songnumber].title;
  _("artist").innerHTML=this._songs.root.song[songnumber].artist;
  _("album").innerHTML=this._songs.root.song[songnumber].album;
  //_("art").src=this._songs.root.song[songnumber].art;  

  this.loadImage(this._songs.root.song[songnumber].art,_("art"));
  
  document.title=currentSong+" "+this._songs.root.song[songnumber].title+"::"+this._songs.root.song[songnumber].artist;
  changeFavicon(this._songs.root.song[songnumber].art);
  showPopup(this._songs.root.song[songnumber].art,this._songs.root.song[songnumber].title,this._songs.root.song[songnumber].artist+" :: "+this._songs.root.song[songnumber].album)
  
  markSong(currentSong);
}


AMPACHE.prototype.nextSong=function() {
  
  currentSong++;
  
  if (currentSong>=this._nsongs)
    currentSong=0;
  conn.localplay(currentSong);
  
  
}

AMPACHE.prototype.prevSong=function() {
  
  currentSong--;
  if (currentSong<=-1)
    currentSong=this._nsongs-1;
  conn.localplay(currentSong);
  
  
}



function markSong(i){
 try {
    
    $("#playlist tr").each(function( index ) {
      this.style.textDecoration="none" ;
    });
    _("s"+i).parentNode.parentNode.style.textDecoration="underline" ;
	
  } catch (idontcare) {
    console.log(idontcare);
  } 
}

var conn;
var currentSong;

/* Initializator */
$(document).ready(function(){

	/* Add event listeners */
	_("cPrev").onclick=function() {conn.prevSong()}
	_("cNext").onclick=function() {conn.nextSong()}
	_("cSettings").onclick=function() {showSettings()}
	_("ampacheplayer").addEventListener("ended",function() {conn.nextSong()});
	_("ampacheplayer").addEventListener("canplay",function() {_("ampacheplayer").play()});

	_("cRandomPl").addEventListener("click",function() {randomizePL()});
	// Load preferences
	loadPreferences();
	
	var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
	window.addEventListener(orientationEvent, function() {
		_('playlistContent').style.width="100%";
	}, false);

	window.addEventListener(orientationEvent, function() {
		_('playlistContent').style.width="100%";
	}, false);
	window.addEventListener("resize", function() {
		_('playlistContent').style.width=window.innerWidth+"px";
	}, false);
	//currentSong=Math.floor((Math.random()*conn._nsongs)+1)-1;
	
});
