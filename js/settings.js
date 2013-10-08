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

var globalUrl = "";
var globalPassword = "";
var globalUsername = "";
var CustomStorage;
var browserApi;
var FANARTAPIKEY = "3b604d4ff932c063108ac40c1a3af2c0";
var useFanArt = false;
var useFeisbuk = false;
var tracing = true;
var windowFeisbuk;
var gUseLyrics = false;

try {
    browserApi = chrome.storage;
}
catch (thisIsNotAChromeApp) {
    browserApi = false;
}

if (typeof app != 'undefined') // android app // android app
	browserApi=false;


if ((!browserApi)) 
{
	console.log("Using localStorage");
    CustomStorage = new Object();
    CustomStorage.setVar = function (vname, vvalue, callback) 
    {
        window.localStorage.setItem(vname, vvalue);
        o = new Object();
        o[vname] = vvalue;
        callback(o);
    }
    CustomStorage.getVar = function (name, callback) 
    {
        o = new Object();
        o[name] = window.localStorage.getItem(name);
        callback(o);
    }
    CustomStorage.delVar = function (name) 
    {
        window.localStorage.removeItem(name);
    }
	CustomStorage.clear=function() {
		window.localStorage.clear();
	}
	CustomStorage.showUse=function() {
		console.log("unknown");
	}
    CustomStorage.mode = "WEB";
}
else 
{
	console.log("Using chrome.storage.local");
    CustomStorage = new Object();
    CustomStorage.setVar = function (vname, vvalue, callback) 
    {
        o = new Object();
        o[vname] = vvalue;
        chrome.storage.local.set(o, callback);
    }
    CustomStorage.getVar = function (name, callback) 
    {
        chrome.storage.local.get(name, callback);
    }
    CustomStorage.delVar = function (name) 
    {
        chrome.storage.local.remove(name);
    }
	CustomStorage.clear=function() {
		 chrome.storage.local.clear();
	}
	CustomStorage.showUse=function(cvar) {
		if(typeof cvar === "undefined") 
			chrome.storage.local.getBytesInUse(null,function (e) {console.log("Total storage bytes:"+e)})
        else
			chrome.storage.local.getBytesInUse(cvar,function (e) {console.log("Storage bytes for "+cvar+":"+e)})
    }	
		 
	
    CustomStorage.mode = "APP";
}



function loadPreferences() 
{
    CustomStorage.getVar("fanart", function (e) 
    {
        if (e.fanart) {
            useFanArt = true;
        }
        else {
            useFanArt = false;
        }
    });

    CustomStorage.getVar("feisbuk", function (e) 
    {
        if (e.feisbuk==true) {
			useFeisbuk=true;
            InitFB();
        }
        else {
            useFeisbuk=false;
        }
    });

   CustomStorage.getVar("uselyrics", function (e) 
    {
        if (e.uselyrics==true) {
			gUseLyrics=true;
            
        }
        else {
            gUseLyrics=false;
        }
    });


    CustomStorage.getVar("username", function (e) 
    {
        if (e.username != null && e.username != "") {
            globalUsername = e.username;
        }
        CustomStorage.getVar("password", function (e) 
        {
            if (e.password != null && e.password != "") {
                globalPassword = e.password;
            }
            CustomStorage.getVar("url", function (e) 
            {
                if (e.url != null && e.url != "") {
                    globalUrl = e.url;
                }
                if ((globalUsername.length > 0) && (globalUrl.length > 0)) {
                    conn = new AMPACHE(globalUsername, globalPassword, globalUrl);
                    closeSettings();
                }
                else {
                    showSettings();
                }
            });
        });
    });
}


function showSettings() 
{
    _("settings").style.display = "block";
    CustomStorage.getVar("username", function (e) 
    {
        _("suser").value = e.username;
    });
    CustomStorage.getVar("password", function (e) 
    {
        _("spass").value = e.password;
    });
    CustomStorage.getVar("url", function (e) 
    {
        _("surl").value = e.url;
    });
    CustomStorage.getVar("fanart", function (e) 
    {
        _("fanart").checked = e.fanart;
    });

	CustomStorage.getVar("feisbuk", function (e) 
    {
        _("publishonfacebook").checked = e.feisbuk;
    });

	CustomStorage.getVar("uselyrics", function (e) 
    {
        _("uselyrics").checked = e.uselyrics;
    });


    _("SaveSettings").onclick = function () 
    {
        CustomStorage.setVar("url", _("surl").value, function (e)  {
			CustomStorage.setVar("username", _("suser").value, function (e) {
                CustomStorage.setVar("password", _("spass").value, function (e) {
					CustomStorage.setVar("fanart", _("fanart").checked, function (e) {
						CustomStorage.setVar("feisbuk", _("publishonfacebook").checked==true, function (e) {
							CustomStorage.setVar("uselyrics", _("uselyrics").checked==true, function (e) {
								loadPreferences();
							});
						});		
					});
				});
			});
		});
    }
	_("ClearCache").onclick = function () 
    {
		CustomStorage.clear();
        CustomStorage.setVar("url", _("surl").value, function (e)  {
        
			CustomStorage.setVar("username", _("suser").value, function (e) {
                CustomStorage.setVar("password", _("spass").value, function (e) {
					CustomStorage.setVar("fanart", _("fanart").checked, function (e) {
						CustomStorage.setVar("feisbuk", _("publishonfacebook").checked=="true", function (e) {
							closeSettings();
					});		
					});
				});
			});
		});
    }
	_("CloseButton").onclick = function () 
    {
	closeSettings();
    }
}

function closeSettings() 
{
    _("settings").style.display = "none";
}

function consoleLog(a) 
{
    console.log(a);
}

