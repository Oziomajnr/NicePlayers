/*
    spYoubora
    Copyright (c) 2014 NicePeopleAtWork
    Author: LluÃƒÂ­Ã‚Â­s Campos Beltran
    Author: Miguel Angel Zambrana
    Author: Ferran Guti 
    Version: 3.1.0 
*/

try { if (!window.console) { var console = {}; } if (!youboraData.log) { youboraData.log = function () {}; } } catch (error) { }

var spYoubora = {
    debug: youboraData.getDebug(),
    autoLoad: true,
    foundDevice: false,
    foundTechnology: "",
    loadedLibs: false,
    userAgent: navigator.userAgent.toLowerCase(),
    isSPYouboraLodad: false,
    preProduction: false,
    forcedVersion: undefined,
    youboraVersion: "1.3",
    protocol :"http://",
    youboraServer: "smartplugin.youbora.com/",
    youboraPreServer: "http://pre.smartplugin.youbora.com/",
    urlLibs: "/js/libs/",
    urlBaseJS: "/js/",
    init: function () {
        try {
            if (spYoubora.userAgent.search("msie") > -1) { spYoubora.debug = false; youboraData.setDebug(false); }
            if(youboraData.getHttpSecure()==true){
                spYoubora.protocol = "https://";
            }
            if (!spYoubora.isSPYouboraLodad) {
                spYoubora.isSPYouboraLodad = true;
                youboraData.log('spYoubora :: Init');
                spYoubora.collectParams();                
                if (spYoubora.preProduction) {
                    spYoubora.urlLibs = spYoubora.youboraPreServer + spYoubora.youboraVersion + spYoubora.urlLibs;
                    spYoubora.urlBaseJS = spYoubora.youboraPreServer + spYoubora.youboraVersion + spYoubora.urlBaseJS;
                } else {
                    spYoubora.urlLibs = spYoubora.protocol + spYoubora.youboraServer + spYoubora.youboraVersion + spYoubora.urlLibs;
                    spYoubora.urlBaseJS = spYoubora.protocol + spYoubora.youboraServer + spYoubora.youboraVersion + spYoubora.urlBaseJS;
                }
                youboraData.log('spYoubora :: Current User-Agent: ' + spYoubora.userAgent); 
                youboraData.log('spYoubora :: Checking Device...');
                spYoubora.checkDevice();
                youboraData.log('spYoubora :: Checking Technology...');
                spYoubora.checkTechnology();
                youboraData.log('spYoubora :: Adding libraries...');
                spYoubora.addLibraries();
            } else {
                youboraData.log("spYoubora :: Already Initialized... ");
            }
        } catch (error) {
            youboraData.log("spYoubora :: init :: Error: " + error);
        }
    },
    deviceNames: { UNKNOWN: 0, IPHONE: 1, IPAD: 2, ANDROID2: 3, ANDROID4: 4, PS3: 5, PS4: 6, APPLETV: 7, LGTV: 8, SAMSUNGTV: 9, PHILIPSTV: 10, ROKU: 11, PC: 12, MAC: 13, PANASONIC: 14, SONY: 15 },
    technologyNames: { UNKNOWN: 0, HTML5: 1, JWPLAYER: 2, OOYALA: 3, BCOVER: 4, SILVERLIGHT_NODRM: 5, SILVERLIGHT_DRM: 6 , VIDEOJS: 7 },
    collectParams: function () {
        try {
            var scripts = document.getElementsByTagName('script');
            var index = 0;
            for (var i = 0; i < scripts.length; i++) { if (scripts[i].src.indexOf('spyoubora') != -1) { index = i; } }
            var spYouboraScript = scripts[index];
            var srcData = spYouboraScript.src.replace(/^[^\?]+\??/, '');
            var Pairs = srcData.split(/[;&]/);
            for (var i = 0; i < Pairs.length; i++) {
                var KeyVal = Pairs[i].split('=');
                if (!KeyVal || KeyVal.length != 2) { continue; }
                var key = unescape(KeyVal[0]);
                var val = unescape(KeyVal[1]);
                val = val.replace(/\+/g, ' ');
                if (key == "preProduction") { this.preProduction = val; }
                if (key == "forcedVersion") { this.forcedVersion = val; }
                if (key == "autoLoad") { this.autoLoad = val; }
                if (this.debug) { youboraData.log("spYoubora :: collectParams :: " + key + " = " + val); }
            }
        } catch (error) {
            if (this.debug) { youboraData.log("spYoubora :: collectParams :: Error :: " + error); }
        }
    },
    checkDevice: function () {
        try {
            if (spYoubora.userAgent.search("iphone") > -1)              { spYoubora.foundDevice = spYoubora.deviceNames.IPHONE; } 
            else if (spYoubora.userAgent.search("ipad") > -1)           { spYoubora.foundDevice = spYoubora.deviceNames.IPAD; } 
            else if (spYoubora.userAgent.search("android 2") > -1)      { spYoubora.foundDevice = spYoubora.deviceNames.ANDROID2; } 
            else if (spYoubora.userAgent.search("android 4") > -1)      { spYoubora.foundDevice = spYoubora.deviceNames.ANDROID4; } 
            else if (spYoubora.userAgent.search("playstation 3") > -1)  { spYoubora.foundDevice = spYoubora.deviceNames.PS3; } 
            else if (spYoubora.userAgent.search("playstation 4") > -1)  { spYoubora.foundDevice = spYoubora.deviceNames.PS4; } 
            else if (spYoubora.userAgent.search("appletv") > -1)        { spYoubora.foundDevice = spYoubora.deviceNames.APPLETV; }
            else if (spYoubora.userAgent.search("lgtv") > -1)           { spYoubora.foundDevice = spYoubora.deviceNames.LGTV; }
            else if (spYoubora.userAgent.search("netcast") > -1)        { spYoubora.foundDevice = spYoubora.deviceNames.LGTV; } 
            else if (spYoubora.userAgent.search("lg") > -1)             { spYoubora.foundDevice = spYoubora.deviceNames.LGTV; }
            else if (spYoubora.userAgent.search("smarttv") > -1)        { spYoubora.foundDevice = spYoubora.deviceNames.SAMSUNGTV; } 
            else if (spYoubora.userAgent.search("philipstv") > -1)      { spYoubora.foundDevice = spYoubora.deviceNames.PHILIPSTV; } 
            else if (spYoubora.userAgent.search("philips") > -1)        { spYoubora.foundDevice = spYoubora.deviceNames.PHILIPSTV; } 
            else if (spYoubora.userAgent.search("roku") > -1)           { spYoubora.foundDevice = spYoubora.deviceNames.ROKU; } 
            else if (spYoubora.userAgent.search("x86") > -1)            { spYoubora.foundDevice = spYoubora.deviceNames.PC; } 
            else if (spYoubora.userAgent.search("x64") > -1)            { spYoubora.foundDevice = spYoubora.deviceNames.PC; } 
            else if (spYoubora.userAgent.search("wow64") > -1)          { spYoubora.foundDevice = spYoubora.deviceNames.PC; } 
            else if (spYoubora.userAgent.search("macintosh") > -1)      { spYoubora.foundDevice = spYoubora.deviceNames.MAC; } 
            else if (spYoubora.userAgent.search("viera") > -1)          { spYoubora.foundDevice = spYoubora.deviceNames.PANASONIC; } 
            else if (spYoubora.userAgent.search("sony") > -1)           { spYoubora.foundDevice = spYoubora.deviceNames.SONY; } 
            else if (spYoubora.foundDevice == false)                    { spYoubora.foundDevice = spYoubora.deviceNames.UNKNOWN; }
        } catch (error) {
            youboraData.log("spYoubora :: checkDevice :: Error: " + error);
        }
    },
    checkTechnology: function () {
        try {
            if (spYoubora.foundDevice == spYoubora.deviceNames.PC || spYoubora.foundDevice == spYoubora.deviceNames.MAC) {
                spYoubora.foundTechnology = spYoubora.technologyNames.UNKNOWN;
                var video = null;
                try { video = document.getElementsByTagName("video")[0]; } catch (error) { youboraData.log("spYoubora :: No <video> found: " + error); }
                if (typeof OO != "undefined") { spYoubora.foundTechnology = spYoubora.technologyNames.OOYALA; } 
                else if (typeof jwplayer != "undefined") { spYoubora.foundTechnology = spYoubora.technologyNames.JWPLAYER; } 
                else if (typeof brightcove != "undefined") { spYoubora.foundTechnology = spYoubora.technologyNames.BCOVER; }
                else if (typeof videojs != "undefined") { spYoubora.foundTechnology = spYoubora.technologyNames.VIDEOJS; }
                else if (video != null) { spYoubora.foundTechnology = spYoubora.technologyNames.HTML5; } 
                else if (typeof PlayerFramework != "undefined") {
                    try { if (typeof PlayerFramework.Plugins.SilverlightMediaPlugin != "undefined") { spYoubora.foundTechnology = spYoubora.technologyNames.SILVERLIGHT_DRM; } } catch (err) {}
                } 
                else if (typeof Silverlight != "undefined") { spYoubora.foundTechnology = spYoubora.technologyNames.SILVERLIGHT_NODRM; }
            } else {
                var video = null;
                try { video = document.getElementsByTagName("video")[0]; } catch (error) { youboraData.log("spYoubora :: No <video> found: " + error);  }
                spYoubora.foundTechnology = spYoubora.technologyNames.UNKNOWN;
                if (typeof jwplayer != "undefined") { spYoubora.foundTechnology = spYoubora.technologyNames.JWPLAYER; } 
                else if (typeof brightcove != "undefined") { spYoubora.foundTechnology = spYoubora.technologyNames.BCOVER; } 
                else if (typeof videojs != "undefined") { spYoubora.foundTechnology = spYoubora.technologyNames.VIDEOJS; }
                else if (video != null) { spYoubora.foundTechnology = spYoubora.technologyNames.HTML5; }
            }
        } catch (error) {
            youboraData.log("spYoubora :: checkTechnology :: Error: " + error);
        }
    },
    addLibraries: function () {
        try {
            
            youboraData.log("spYoubora :: Found Device :: " + spYoubora.foundDevice);
            youboraData.log("spYoubora :: Found Technology :: " + spYoubora.foundTechnology);
            
            if (((spYoubora.foundDevice == spYoubora.deviceNames.PC) || (spYoubora.foundDevice == spYoubora.deviceNames.MAC)) && spYoubora.foundTechnology == spYoubora.technologyNames.HTML5) {
                
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-html5/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-html5/3.1.1/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundTechnology == spYoubora.technologyNames.HTML5) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }

                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-html5/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-html5/3.2.0/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundTechnology == spYoubora.technologyNames.JWPLAYER) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
            } else if (spYoubora.foundTechnology == spYoubora.technologyNames.OOYALA) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-ooyala/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-ooyala/3.2.0/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundTechnology == spYoubora.technologyNames.BCOVER) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-bcove/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-bcove/3.2.0/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
	    } else if (spYoubora.foundTechnology == spYoubora.technologyNames.VIDEOJS) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-videojs/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'pc-videojs/3.3.2/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundDevice == spYoubora.deviceNames.PS3 || spYoubora.foundDevice == spYoubora.deviceNames.PS4) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'ps3-webmaf/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'ps3-webmaf/3.1.2/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundDevice == spYoubora.deviceNames.PHILIPSTV) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'phillips/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'phillips/3.0.0/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundDevice == spYoubora.deviceNames.SAMSUNGTV) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'tv-samsung/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'tv-samsung/3.0.0/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundDevice == spYoubora.deviceNames.PANASONIC) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'tv-panasonic/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'tv-panasonic/3.1.0/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundDevice == spYoubora.deviceNames.SONY) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'tv-sony/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'tv-sony/3.1.1/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundDevice == spYoubora.deviceNames.LGTV) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'lg/' + this.forcedVersion + '/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'lg/3.0.0/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundTechnology == spYoubora.technologyNames.SILVERLIGHT_NODRM) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'silverlight/' + this.forcedVersion + '/no-drm/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'silverlight/3.0.0/no-drm/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else if (spYoubora.foundTechnology == spYoubora.technologyNames.SILVERLIGHT_DRM) {
                if (spYoubora.isYouboraApiLoaded() == false) { spYoubora.loadJavascriptFile(spYoubora.urlLibs + 'youbora-api.min.js', function () {}); }
                if (spYoubora.isSmartPluginLoaded() == false) {
                    if (this.forcedVersion != undefined) {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'silverlight/' + this.forcedVersion + '/drm/sp.min.js', function () { SmartPlugin.Init(); });
                    } else {
                        spYoubora.loadJavascriptFile(spYoubora.urlBaseJS + 'silverlight/3.0.0/drm/sp.min.js', function () { SmartPlugin.Init(); });
                    }
                } else { SmartPlugin.Init(); }
            } else {
                youboraData.log("spYoubora :: No devices found...");
            }
        } catch (error) {
            youboraData.log("spYoubora :: addLibraries :: Error: " + error);
        }
    },
    isYouboraDataLoaded: function () {
        try {
            var isLoaded = false;
            if (typeof YouboraData == "function") { isLoaded = true; } else { isLoaded = false; }
            youboraData.log("spYoubora :: YouboraData is loaded :: " + isLoaded);
            return isLoaded;
        } catch (error) {
           youboraData.log("spYoubora :: isYouboraDataLoaded :: Error: " + error);
            return false;
        }
    },
    isYouboraApiLoaded: function () {
        try {
            var isLoaded = false;
            if (typeof YouboraCommunication == "function") { isLoaded = true; } else { isLoaded = false; }
            youboraData.log("spYoubora :: YouboraApi is loaded :: " + isLoaded);
            return isLoaded;
        } catch (error) {
            youboraData.log("spYoubora :: isYouboraApiLoaded :: Error: " + error);
            return false;
        }
    },
    isSmartPluginLoaded: function () {
        try {
            var isLoaded = false;
            if (typeof SmartPlugin !== "undefined") { isLoaded = true; } else { isLoaded = false; }
            youboraData.log("spYoubora :: SmartPlugin is loaded :: " + isLoaded);
            return isLoaded;
        } catch (error) {
            youboraData.log("spYoubora :: isSmartPluginLoaded :: Error: " + error);
            return false;
        }
    },
    loadJavascriptFile: function (url, callback) {
        try {
            youboraData.log("spYoubora :: Load JS File :: " + url);
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.onreadystatechange = callback;
            script.onload = callback;
            head.appendChild(script);
        } catch (error) {
            youboraData.log("spYoubora :: loadJavascriptFile :: Error :: " + error);
        }
    },
    reload: function () {
        spYoubora.debug = true
        spYoubora.autoLoad = true;
        spYoubora.foundDevice = false;
        spYoubora.foundTechnology = "";
        spYoubora.loadedLibs = false;
        spYoubora.userAgent = navigator.userAgent.toLowerCase();
        spYoubora.isSPYouboraLodad = false;
        spYoubora.forcedVersion = undefined;
        spYoubora.preProduction = false;
        spYoubora.youboraVersion = "1.3";
        spYoubora.youboraServer = "http://smartplugin.youbora.com/";
        spYoubora.youboraPreServer = "http://smartplugin-pre.youbora.com/";
        spYoubora.urlLibs = "/js/libs/";
        spYoubora.urlBaseJS = "/js/";
        try { youboraData.concurrencySessionId = Math.random(); } catch (err) { }
        spYoubora.init();
    }
}

try {
    if (spYoubora.autoLoad) {
        window.onload = function () { spYoubora.init(); };
        document.onload = function () { spYoubora.init(); };
    }
} catch (error) {
    try {
        if (spYoubora.autoLoad) {
            document.onload = spYoubora.init();
            window.onload = spYoubora.init();
        };
    } catch (error) {
        youboraData.log("spYoubora :: Init :: Error: " + error);
    }
}