

function _getCachedData(i,durl,ret) {
  
  var request = $.ajax({
	url: durl,
	type: "GET",
	dataType: "text"
	});

	request.done(function(rawdata) {
		xml = xml2array($.parseXML(rawdata));
		ret(xml);
		
	});
}