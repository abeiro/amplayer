

function ceventFired(evType) {
	a=jQuery("div.plButton")
	for (i=0;i<a.length;i++) {
		
		a[i].onclick=function() {
			conn.localplay(this.getAttribute("songnumber"));
		}

	}
}

function loadPlayList() {
  
    songsArray=new Array();
	for (i in conn._songs.root.song) {
		f=conn._songs.root.song[i];
		songsArray[i]=["<div class='plButton' id='s"+i+"' songnumber='"+i+"'><img src='images/play.png'></div>",
						f["title"],f["artist"],f["album"] ] 
	}
    
    $('#playlist').html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="playlistContent"></table>' );
    $('#playlistContent')
		.bind('sort',   function () { ceventFired( 'Sort' ); })
        .bind('filter', function () { ceventFired( 'Filter' ); })
        .bind('page',   function () { ceventFired( 'Page' ); })
		.dataTable( {
        "aaData": songsArray,
        "aoColumns": [
			{ "sTitle": "","sWidth": "22px" },
            { "sTitle": "Title", "sWidth": "150px"},
            { "sTitle": "Artist" },
            { "sTitle": "Album" }
        ]
    } );   
	$("#playlistContent_paginate").on("click", "a", function() { ceventFired(null) });
	//$('#playlistContent_paginate').live('click', function(){ ceventFired(null); });
	//$('#playlistContent tbody tr').live('click', function () {ceventFired(null)});
	//document.querySelector(".plButton").onclick=function() {conn.nextSong()}
	ceventFired(null);
	
}
