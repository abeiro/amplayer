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




function publishOnFaceBook() {
        if (window.plugins != undefined) 
        if (window.plugins.socialsharing != undefined) {
            a=conn._songs.root.song[currentSong];
            if (a.fanart) 
				picture=a.fanart;
            else
				picture=convertImgToBase64URL(_("art").src);

            if (a.mbid)
		link="http://musicbrainz.org/recording/"+a.mbid+"?inc=artist-credits+isrcs+releases";
            else
		link="";
                
            window.plugins.socialsharing.share(
            "Just listened "+a.title+" ("+a.artist+")",
            "I like this song: ",
            picture,
            link);
            return;
        }
  	$("#cLike").fadeOut();
	try {
		a=conn._songs.root.song[currentSong];
		if (a.fanart) 
			picture=a.fanart;
		else
			picture="";

		if (a.mbid)
			link="http://musicbrainz.org/recording/"+a.mbid+"?inc=artist-credits+isrcs+releases";
		else
			link="";

                s="http://amplayer.xyz/share/?caption="+encodeURIComponent("Just listened "+a.title+" ("+a.artist+")")+"&link="+link+"&redirect_uri="+encodeURIComponent("https://goo.gl/lfF9vO")+"&picture="+encodeURIComponent(picture)+"&mbid="+a.mbid
                console.log(s);
                //window.open(s);
                openWindow(s,'Share','socialWindow')
                
                $("#cLike").fadeIn();
	} catch (e) {

	}

}

function openWindow(wurl,wtitle,wid) {

		chrome.app.window.create("webview.html",{id:wid},function() {
			lastfmwindow=chrome.app.window.get(wid)
			lastfmwindow.contentWindow.main=function() {
				wv=lastfmwindow.contentWindow.document.getElementById('webwindow')
				lastfmwindow.contentWindow.document.title=wtitle;
				wv.src=wurl
	
				lastfmwindow.onClosed.addListener(function (e) {
					console.log(wid+" closed "+e)
				
				})

				lastfmwindow.addEventListener('permissionrequest', function(e) {
					console.log(e)
					 e.request.allow();
				
				})
			}
	
		})
}

function convertImgToBase64URL(url){
        sImg=new Image;
        sImg.src=url;
        var canvas = document.createElement('CANVAS');
        canvas.style.display="none";
        ctx = canvas.getContext('2d');
        canvas.height = sImg.height;
        canvas.width = sImg.width;
        ctx.drawImage(sImg, 0, 0);
        dataURL = canvas.toDataURL("jpg");
        //callback(dataURL);
        return dataURL;
}

function InitFB() {

	return; //This is deprecated
	client_id='576853419017449';

	if (browserApi) {
		try {
		MY_FACEBOOK_OAUTH_URL='https://www.facebook.com/dialog/oauth?client_id='+client_id+'&redirect_uri=https://'+chrome.runtime.id+'.chromiumapp.org/bast&scope=publish_actions&response_type=token';
		console.log(MY_FACEBOOK_OAUTH_URL);
		chrome.identity.launchWebAuthFlow({
			url: MY_FACEBOOK_OAUTH_URL,
			interactive: true

		}, function(e){ 
			console.log(e);
			if (typeof e == 'undefined' )
				console.log("Couldn't get feisbuk token:"+e);
			else {
				console.log(e);
				ACCESS_TOKEN=e.split("#")[1].split("=")[1].split("&")[0];	
				
				$.get("https://graph.facebook.com/me?access_token="+ACCESS_TOKEN) 
				.done(function(fdata) {
						console.log(fdata);
						USER_PAGE=fdata.id;
					})
				
				}
			}
		);
		} catch (feisbukunava) {
			console.log("Not a chrome app, so no facebook (atm)");
		}
	} else {
		MY_FACEBOOK_OAUTH_URL='https://www.facebook.com/dialog/oauth?client_id='+client_id+'&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=publish_actions&response_type=token';
		console.log(MY_FACEBOOK_OAUTH_URL);
		//window.location.replace(MY_FACEBOOK_OAUTH_URL);
					
		
		try {

			/*var jqxhr = $.getJSON( MY_FACEBOOK_OAUTH_URL, function() {
				console.log( "success" );
			})
			.done(function(xhr) {
				console.log( "second success" + xhr );
			})
			.fail(function(xhr) {
				console.log( "error" + xhr );
			})
			.always(function(xhr) {
				console.log( "complete" + xhr );
			});*/

			$.ajax({
				type: "GET",
				url: MY_FACEBOOK_OAUTH_URL,
				cache: false,
				dataType: 'JSONP',
				beforeSend: function(xhr){
					xhr.setRequestHeader('X-Test-Header', 'test-value');
						
				},
			}).done ( function(xhr, status, error) {
					debugger;
					console.log("Error:"+xhr);
					
				}
			).fail(function(xhr) {

						console.log(xhr);
				}

			);
		
		}
		catch (Error) {
			alert(Error);
		}
		//debugger;
	}
}



