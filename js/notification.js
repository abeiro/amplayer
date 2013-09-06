
    function showPopup(thumb,title,body) {
			if (!window.webkitNotifications) {
				return;
				
			}
			if (window.webkitNotifications.checkPermission() == 0)  {
				var popup = window.webkitNotifications.createNotification(thumb, title, body);

							//Show the popup
							popup.show();

							//set timeout to hide it
							setTimeout(function() {
								popup.cancel();
							}, 5000);
			} else {
				window.webkitNotifications.requestPermission();
			}

    }
    


document.head || (document.head = document.getElementsByTagName('head')[0]);
 
function changeFavicon(src) {
 var link = document.createElement('link'),
     oldLink = document.getElementById('dynamic-favicon');
 link.id = 'dynamic-favicon';
 link.rel = 'shortcut icon';
 link.href = src;
 if (oldLink) {
  document.head.removeChild(oldLink);
 }
 document.head.appendChild(link);
}