
function getCachedData(i,url) {
  if (!localStorage) 
    console.log('Local storage unsuported');
  if(localStorage && localStorage.getItem(i)){
    return (JSON.parse(localStorage.getItem(i)));
  } else {
    rawdata=file_get_contents(url);
    xml = xml2array($.parseXML(rawdata));
    localStorage.setItem(i,JSON.stringify(xml));
    return xml;
  }
}


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