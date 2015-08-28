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

/*
<script>
	var Notification = window.Notification || window.mozNotification || window.webkitNotification;

	Notification.requestPermission(function (permission) {
		// console.log(permission);
	});

	function show() {
		window.setTimeout(function () {
			var instance = new Notification(
				"Fu", {
					body: "FUmsg"
				}
			);

			instance.onclick = function () {
				// Something to do
			};
			instance.onerror = function () {
				// Something to do
			};
			instance.onshow = function () {
				// Something to do
			};
			instance.onclose = function () {
				// Something to do
			};
		}, 1000);

		return false;
	}
</script>

<a href="#" onclick="return show()">Notify me!</a>
*/
function showPopup(thumb, title, tbody) 
{
    if (!window.Notification) {
        return;
    }
    if (window.Notification.permission == "granted") 
    {
        var popup = new window.Notification(title,{body:tbody,icon:thumb});
		
        setTimeout(function () 
        {
            popup.close();
        }, 5000);
    }
    else {
        window.Notification.requestPermission();
    }
}


document.head || (document.head = document.getElementsByTagName('head')[0]);

function changeFavicon(src) 
{
    /*var link = document.createElement('link'), oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
	*/
    var xhr = new XMLHttpRequest();
	xhr.open('GET', src, true);
	xhr.responseType = 'blob';
	xhr.onload = function(e) {
  		/*var img = document.createElement('img');
  		img.src = window.URL.createObjectURL(this.response);
  		document.body.appendChild(img);*/
  		var link = document.createElement('link'), oldLink = document.getElementById('dynamic-favicon');
    	link.id = 'dynamic-favicon';
    	link.rel = 'shortcut icon';
    	link.href =  window.URL.createObjectURL(this.response);
    	if (oldLink) {
        	document.head.removeChild(oldLink);
    	}
    	document.head.appendChild(link);
	};
	xhr.send();
}
