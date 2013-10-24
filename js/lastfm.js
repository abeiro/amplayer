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


var APIKEY='eb02a6ef37fdf208dee289eac9e00ed3';
var LASTFMURL="http://ws.audioscrobbler.com/2.0/?method=";


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