
var globalUrl="";
var globalPassword="";
var globalUsername="";
var CustomStorage;
var browserApi;
var FANARTAPIKEY="3b604d4ff932c063108ac40c1a3af2c0";
var useFanArt=false;
var tracing=true;

try {
	browserApi=chrome.storage;
} catch (thisIsNotAChromeApp) {
	browserApi=false;

}
if ((!browserApi)) {

	CustomStorage=new Object();
	CustomStorage.setVar=function (vname, vvalue,callback) {
		localStorage.setItem(vname,vvalue);
		o=new Object();
		o[vname]=vvalue;
		callback(o);
	}
	CustomStorage.getVar=function (name,callback)
	 {
		o=new Object();
		o[name]=localStorage.getItem(name);
		callback(o);
	}
	CustomStorage.mode="WEB";

}
else {
	CustomStorage=new Object();
	CustomStorage.setVar=function (vname, vvalue,callback) {
		o=new Object();
		o[vname]=vvalue;
		chrome.storage.local.set(o,callback);
	}
	CustomStorage.getVar=function (name,callback) {
		chrome.storage.local.get(name,callback);
	}

	CustomStorage.mode="APP";
}

function loadPreferences() {

	CustomStorage.getVar("fanart",function (e) {
		if (e.fanart)
			useFanArt=true;
		else
			useFanArt=false;
	});

	CustomStorage.getVar("username",function (e) {
		if (e.username!=null && e.username!="")
			globalUsername=e.username;
			CustomStorage.getVar("password",function (e) {
				if (e.password!=null && e.password!="")
					globalPassword=e.password;
					CustomStorage.getVar("url",function (e) {
						if (e.url!=null && e.url!="")
							globalUrl=e.url;
						if ((globalUsername.length>0) && (globalUrl.length>0)) {
							conn=new AMPACHE(globalUsername,globalPassword,globalUrl);
							closeSettings();
						}
						else
							showSettings();

					});
			});

	});

	
}

function showSettings() {

	_("settings").style.display="block";
	CustomStorage.getVar("username",function (e) {
		_("suser").value=e.username;
	});
	CustomStorage.getVar("password",function (e) {
		_("spass").value=e.password;
	});
	CustomStorage.getVar("url",function (e) {
		_("surl").value=e.url;
	});

	CustomStorage.getVar("fanart",function (e) {
		_("fanart").checked=e.fanart;
	});

	_("SaveSettings").onclick=function() {
		CustomStorage.setVar("url",_("surl").value,function (e) {consoleLog(e)});
		CustomStorage.setVar("username",_("suser").value,function (e) {consoleLog(e)});
		CustomStorage.setVar("password",_("spass").value,function (e) {consoleLog(e)});
		CustomStorage.setVar("fanart",_("fanart").checked,function (e) {consoleLog(e)});
		loadPreferences();
		
	}
}

function closeSettings() {

	_("settings").style.display="none";
	
}

function consoleLog(a) {
	if (tracing)
		console.log(a);

}