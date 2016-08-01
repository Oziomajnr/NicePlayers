/*
 * YouboraCommunication
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Miguel Angel Zambrana - Biel Conde
 * Version: 3.1.0
 */

//ie console.log hack
try{if(typeof console==="undefined"){window.console = {log: function(){},info: function(){},error: function(){},warn: function(){}}}}catch(err){}

function YouboraCommunication(system, service, bandwidth, pluginVersion, targetDevice) {
    try {

        // user     
        this.system = system;
        this.service = service;
        this.bandwidth = bandwidth;

        // configuration
        this.pluginVersion = pluginVersion;
        this.targetDevice = targetDevice;
        this.outputFormat = "xml";
        this.xmlHttp = null;
        this.isXMLReceived = false;

        // urls
        this.pamBufferUnderrunUrl = "";
        this.pamSeekUrl = "";
        this.pamJoinTimeUrl = "";
        this.pamStartUrl = "";
        this.pamStopUrl = "";
        this.pamPauseUrl = "";
        this.pamResumeUrl = "";
        this.pamPingUrl = "";
        this.pamErrorUrl = "";
        this.pamAdsUrl = "";

        // code7
        this.pamCode = "";
        this.pamCodeOrig = "";
        this.pamCodeCounter = 0;

        // ping
        this.pamPingTime = 5000;
        this.lastPingTime = 0;
        this.diffTime = 0;

        // queue events
        this.canSendEvents = false;
        this.eventQueue = [];
        this.startSent = false;

        // fast data
        this.fastDataValid = false;

        // debug
        this.debug = youboraData.getDebug();
        this.debugHost = "";

        // concurrency timer
        var self = this;
        this.concurrencyTimer = "";

        // resume timer 
        this.resumeInterval = "";
        this.currentTime = 0;
        this.wasResumed = 0;

        // balance callback
        this.balancedUrlsCallback = function () {};
        this.balancedCallback = function () {};

        this.cdnNodeDataSendRequest = false;
        this.cdnNodeDataRequestFinished = false;
        this.checkM3U8 = false;

        // Node Host data
        this.nodeHostDataStart = {
            host: "",
            type: ""
        };

        this.l3types = {
            UNKNOWN: 0,
            TCP_HIT: 1,
            TCP_MISS: 2,
            TCP_MEM_HIT: 3,
            TCP_IMS_HIT: 4
        };

        this.l3IsNodeSend = false;
        this.resourcePath = "";
        this.protocol ="http://";



        this.createXMLHttpRequest = function() {
            if (window.XMLHttpRequest) {
                //Firefox, Opera, IE7, and other browsers will use the native object
                return new XMLHttpRequest();
            } else {
                //IE 5 and 6 will use the ActiveX control
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        };

        this.getRealResourceHLS = function(resource, callback) {
            var that = this;
            var extension = /\.([0-9a-zA-Z]+)(?:[\?#]|$)/.exec(resource)[1];
            if(extension == 'm3u8' || extension == 'M3U8') {
                this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
                this.xmlHttp.context = this;
                this.xmlHttp.open("GET", resource, true);

                this.xmlHttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var file = this.responseText.split('\n');
                        var newUrl = resource; 
                        for(var key in file) {
                            if(file[key].indexOf('http://') > -1 || file[key].indexOf('https://') > -1) {
                                newUrl = file[key];
                                break;
                            }
                        }

                        that.getRealResourceHLS(newUrl, callback);
                    }                 
                }

                this.xmlHttp.send();

            } else {
                youboraData.setCDNNodeDataObtained(true);
                youboraData.setMediaResource(resource);
                this.checkM3U8 = true;
                callback();         
            }
        };

        if(youboraData.getHttpSecure() == true){
            this.protocol ="https://";
        }

        if (typeof youboraData != "undefined") {
            if (youboraData.concurrencyProperties.enabled) {
                this.concurrencyTimer = setInterval(function () {
                    self.checkConcurrencyWork();
                }, 10000);
                youboraData.log("YouboraCommunication :: Concurrency :: Enabled");
            } else {
                youboraData.log("YouboraCommunication :: Concurrency :: Disabled");
            }
            if (youboraData.resumeProperties.resumeEnabled) {
                this.checkResumeState();
                youboraData.log("YouboraCommunication :: Resume :: Enabled");
            } else {
                youboraData.log("YouboraCommunication :: Resume :: Disabled");
            }
            if (youboraData.cdn_node_data == true) {
                youboraData.log("YouboraCommunication :: Level3 :: Enabled");
            } else {
                youboraData.log("YouboraCommunication :: Level3 :: Disabled");
            }
            if (youboraData.getBalanceEnabled()) {
                youboraData.log("YouboraCommunication :: Balancer :: Enabled");
            } else {
                youboraData.log("YouboraCommunication :: Balancer :: Disabled");

            }
        } else {
            youboraData.log("YouboraCommunication :: Unable to reach youboraData :: Concurrency / Resume / Level3 :: Disabled");
        }

        if(youboraData.getHttpSecure() == true){
            this.protocol ="https://";
        }

        this.init();

    } catch (error) {
        if (this.debug) {
            youboraData.log("YouboraCommunication :: Error: " + error);
        }
    }
}

YouboraCommunication.prototype.init = function () {
    try {
        var context = this;
        this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
        this.xmlHttp.context = this;
        this.xmlHttp.addEventListener("load", function (httpEvent) {
            this.context.loadAnalytics(httpEvent);
        }, false);
        if(youboraData.getHttpSecure()==true){
            this.service = this.protocol + this.service.split("//")[1];
        }
        var urlDataWithCode = this.service + "/data?system=" + this.system + "&pluginVersion=" + this.pluginVersion + "&targetDevice=" + this.targetDevice + "&outputformat=" + this.outputFormat;
        if(youboraData.getNqsDebugServiceEnabled() == true){
            urlDataWithCode = urlDataWithCode + "&nqsDebugServiceEnabled=true";
        }
        this.xmlHttp.open("GET", urlDataWithCode, true);
        this.xmlHttp.send();

        // Get Original chunk from HLS, or get NodeHost/NodeType
        this.resourceTreatment();

        youboraData.log("YouboraCommunication :: HTTP Fastdata Request :: " + urlDataWithCode);
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.resourceTreatment = function () {
    var that = this;
    if ( youboraData.getMediaResource() !== undefined && youboraData.getMediaResource() !== "" ) {
        this.getRealResourceHLS(youboraData.getMediaResource(), function() { 
            if ( youboraData.cdn_node_data ) { 
                that.getLevel3Header();
            }
        }); 
    }
};

YouboraCommunication.prototype.cdnNodeHostReady = function () {
    if (youboraData.cdn_node_data == false) 
        return true;
    
    if (this.cdnNodeDataSendRequest && this.cdnNodeDataRequestFinished ) 
        return true;

    return false;
};

YouboraCommunication.prototype.cleanResource = function (originalResource) {
    return originalResource.split("?")[0];
};

YouboraCommunication.prototype.getLevel3Header = function () {
    if (typeof youboraData != "undefined") {
        var context = this;

        if (youboraData.cdn_node_data == false) return;

        if (this.cdnNodeDataSendRequest) return; 

        if (youboraData.getMediaResource().length > 0) {
            try {
                this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
                this.xmlHttp.context = this;
                this.xmlHttp.addEventListener("load", function (httpEvent) {
                    try {
                        var header = httpEvent.target.getResponseHeader('X-WR-DIAG').toString();
                        this.context.parseL3Header(header, 1);
                    } catch (e) {
                        youboraData.log("YouboraCommunication :: Level3 :: Error parsing header" + e);
                        this.context.getAkamaiHeader();
                    }
                }, true);

                this.xmlHttp.addEventListener("error", function (httpEvent) {
                    this.context.getAkamaiHeader();
                }, true);

                this.xmlHttp.open("head", this.cleanResource ( youboraData.getMediaResource() ) , true);
                this.xmlHttp.setRequestHeader('X-WR-Diag', 'host');
                this.xmlHttp.send();

                // Sent Request Flag
                this.cdnNodeDataSendRequest = true;

                youboraData.log("YouboraCommunication :: HTTP LEVEL3 Header Request :: " + youboraData.getMediaResource());
            } catch (error) {
                youboraData.log("YouboraCommunication :: Level3 :: Error with header, disabling header check");
                this.context.getAkamaiHeader();
            }
        } 
    }
};

YouboraCommunication.prototype.parseL3Header = function (header, typeCall) {
    try {
        var l3Response  = header;
        l3Response      = l3Response.split(" ");
        l3Response.host = l3Response[0].replace("Host:", "");
        l3Response.type = l3Response[1].replace("Type:", "");

        if (l3Response.type == "TCP_HIT") {
            l3Response.type = this.l3types.TCP_HIT;
        } else if (l3Response.type == "TCP_MISS") {
            l3Response.type = this.l3types.TCP_MISS;
        } else if (l3Response.type == "TCP_MEM_HIT") {
            l3Response.type = this.l3types.TCP_MEM_HIT;
        } else if (l3Response.type == "TCP_IMS_HIT") {
            l3Response.type = this.l3types.TCP_IMS_HIT;
        } else {
            youboraData.log("YouboraCommunication :: Level3 :: Unknown type received: " + l3Response.type);
            l3Response.type = this.l3types.UNKNOWN;
        }
        
        this.nodeHostDataStart.host = l3Response.host;
        this.nodeHostDataStart.type = l3Response.type;

        youboraData.log("YouboraCommunication :: Level3 :: onLoad :: Host: " + this.nodeHostDataStart.host + " :: Type: " + this.nodeHostDataStart.type);
        youboraData.setCDNNodeDataObtained(true);

        this.cdnNodeDataRequestFinished = true;
        this.sendEventsFromQueue();
        
        return true;
    } catch (error) {
        youboraData.setCDNNodeData(false);
        youboraData.log("YouboraCommunication :: Level3 :: Error with header, disabling header check" +error);
        
        this.cdnNodeDataRequestFinished = true;
        this.sendEventsFromQueue();

        return false;
    }
};

YouboraCommunication.prototype.getAkamaiHeader = function () {
    try{
        if (youboraData.cdn_node_data == false) return;

        if (youboraData.getMediaResource().length > 0) {
            this.xmlHttp = this.createXMLHttpRequest(); //new XMLHttpRequest();
            this.xmlHttp.context = this;

            this.xmlHttp.addEventListener("load", function (httpEvent) {
                try {
                    this.context.parseAkamaiHeader(httpEvent.target.getResponseHeader('X-Cache'));
                } catch (e) {
                    youboraData.log("YouboraCommunication :: Akamai :: Error parsing header"+e); 
                    youboraData.setCDNNodeData(false);

                    this.cdnNodeDataRequestFinished = true;
                    this.sendEventsFromQueue();
                }
            }, true);

            this.xmlHttp.open("head", this.cleanResource( youboraData.getMediaResource() ) , true);
            this.xmlHttp.send();

            // Sent Request Flag
            this.cdnNodeDataSendRequest = true;
        } 
     }catch(err){
        youboraData.setCDNNodeData(false);
        youboraData.log("YouboraCommunication :: Akamai :: Error with header, disabling header check");
    }

};

YouboraCommunication.prototype.parseAkamaiHeader = function (header) {
    try {
        var l3Response = header;
        l3Response = l3Response.split(" ");
        l3Response.type = l3Response[0].replace("Type:", "");
        l3Response.host = l3Response[3].split("/")[1].replace(")","");

        if (l3Response.type == "TCP_HIT") {
            l3Response.type = this.l3types.TCP_HIT;
        } else if (l3Response.type == "TCP_MISS") {
            l3Response.type = this.l3types.TCP_MISS;
        } else if (l3Response.type == "TCP_MEM_HIT") {
            l3Response.type = this.l3types.TCP_MEM_HIT;
        } else if (l3Response.type == "TCP_IMS_HIT") {
            l3Response.type = this.l3types.TCP_IMS_HIT;
        } else {
            //if (this.debug) {
            youboraData.log("YouboraCommunication :: Akamai :: Unknown type received: " + l3Response.type);
            //}
            l3Response.type = this.l3types.UNKNOWN;
        }
       
        this.nodeHostDataStart.host = l3Response.host;
        this.nodeHostDataStart.type = l3Response.type;

        youboraData.log("YouboraCommunication :: Akamai :: onLoad :: Host: " + this.nodeHostDataStart.host + " :: Type: " + this.nodeHostDataStart.type);

        this.cdnNodeDataRequestFinished = true;
        this.sendEventsFromQueue();
       
        return true;
    } catch (error) {
        youboraData.setCDNNodeData(false);

        this.cdnNodeDataRequestFinished = true;
        this.sendEventsFromQueue();

        youboraData.log("YouboraCommunication :: Akamai :: Error with header, disabling header check" + error);
       
        return false;
    }
};

YouboraCommunication.prototype.checkResumeState = function () {
    var resumeService = youboraData.getResumeService();
    var resumeContentId = youboraData.getContentId();
    var resumeUserid = youboraData.getUsername();
    var context = this;

    resumeService = this.protocol + resumeService.split("//")[1];

    if (youboraData.getResumeEnabled()) {
        if (resumeContentId.length > 0) {
            if (resumeUserid.length > 0) {
                try {
                    this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
                    this.xmlHttp.context = this;
                    this.xmlHttp.addEventListener("load", function (httpEvent) {
                        this.context.validateResumeStatus(httpEvent);
                    }, false);
                    var urlDataWithCode = resumeService + "?contentId=" + resumeContentId + "&userId=" + resumeUserid + "&random=" + Math.random();
                    this.xmlHttp.send();
                    youboraData.log("YouboraCommunication :: checkResumeState :: HTTP Reusme Request :: " + urlDataWithCode);
                    youboraData.log("YouboraCommunication :: checkResumeState :: Resume :: Enabled");
                } catch (error) {
                    clearInterval(this.resumeInterval);
                    youboraData.log("YouboraCommunication :: checkResumeState :: Error while performig resume petition ::" + error);
                }
            } else {
                youboraData.log("YouboraCommunication :: checkResumeState :: Resume enabled without username defined :: Resume Disabled");
            }
        } else {
            youboraData.log("YouboraCommunication :: checkResumeState :: Resume enabled without contentId defined :: Resume Disabled");
        }
    } else {
        youboraData.log("YouboraCommunication :: checkResumeState :: Resume disabled in data. ");
    }
};

YouboraCommunication.prototype.validateResumeStatus = function (httpEvent) {
    try {
        if (httpEvent.target.readyState == 4) {
            var response = httpEvent.target.response.toString();
            if (response > 0) {
                var resumeCallback = youboraData.getResumeCallback();
                youboraData.log("YouboraCommunication :: Resume :: Available ::");
                if (typeof resumeCallback == "function") {
                    this.wasResumed = 1;
                    resumeCallback(response);
                    youboraData.log("YouboraCommunication :: Resume :: Executed Function");
                } else  if (typeof resumeCallback == "string") {
                    eval(resumeCallback);
                } else {
                    youboraData.log("YouboraCommunication :: Unable to determine callback type!");
                }
            } else if (response == "0") {
                youboraData.log("YouboraCommunication :: Resume :: No previous state...");
            } else {
                clearInterval(this.resumeInterval);
                youboraData.log("YouboraCommunication :: Resume :: Empty response... stoping rsume.");
            }
        }
    } catch (error) {
        clearInterval(this.resumeInterval);
        youboraData.log("YouboraCommunication :: validateResumeStatus :: Error: " + error);
    }
};

YouboraCommunication.prototype.sendPlayTimeStatus = function () {
    var mainContext = this;
    var playTimeService = youboraData.getPlayTimeService();
    var resumeContentId = youboraData.getContentId();
    var resumeUserid = youboraData.getUsername();

    playTimeService = this.protocol + playTimeService.split("//")[1];
    try {
        if (youboraData.getResumeEnabled()) {
            this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
            this.xmlHttp.addEventListener("load", function (httpEvent) {}, false);
            var urlDataWithCode = playTimeService + "?contentId=" + resumeContentId + "&userId=" + resumeUserid + "&playTime=" + Math.round(this.currentTime) + "&random=" + Math.random();
            this.xmlHttp.open("GET", urlDataWithCode, true);
            this.xmlHttp.send();
            youboraData.log("YouboraCommunication :: HTTP Resume Request :: " + urlDataWithCode);
        } else {
            youboraData.log("YouboraCommunication :: sendPlayTimeStatus :: Resume disabled in data.");
        }
    } catch (error) {
        clearInterval(this.resumeInterval);
        youboraData.log("YouboraCommunication :: sendPlayTimeStatus :: Error: " + error);
    }
};

YouboraCommunication.prototype.enableResume = function () {
    try {
        youboraData.setResumeEnabled(true);
        var context = this;
        clearInterval(this.resumeInterval);
        this.resumeInterval = setInterval(function () { context.sendPlayTimeStatus(); }, 6000);
        this.checkResumeState();
        youboraData.log("YouboraCommunication :: enableResume :: Resume is now enabled");
    } catch (err) {
        clearInterval(this.resumeInterval);
        youboraData.log("YouboraCommunication :: enableResume :: Error: " + err);
    }
};

YouboraCommunication.prototype.disableResume = function () {
    try {
        youboraData.setResumeEnabled(false);
        clearInterval(this.resumeInterval);
        youboraData.log("YouboraCommunication :: disableResume :: Resume is now disabled");
    } catch (err) {
        clearInterval(this.resumeInterval);
        youboraData.log("YouboraCommunication :: disableResume :: Error: " + err);
    }
};

YouboraCommunication.prototype.getPingTime = function () {
    return this.pamPingTime;
};

YouboraCommunication.prototype.sendStartL3 = function (totalBytes, referer, properties, isLive, resource, duration, transcode) {
    this.sendStart (totalBytes, referer, properties, isLive, resource, duration, transcode);
};

YouboraCommunication.prototype.sendStart = function (totalBytes, referer, properties, isLive, resource, duration, transcode) {    
    try {
        if ((transcode == undefined) || (transcode == "undefined") || (transcode == "")) { transcode = youboraData.getTransaction(); }
        if (duration == undefined || duration == "undefined") { duration = 0; }
        this.bandwidth.username = youboraData.getUsername();

        if ( resource != undefined && resource != "" ) {
            // Get Original chunk from HLS, or get NodeHost/NodeType
            this.resourceTreatment();
        } else {
            youboraData.setCDNNodeData(false);
        }

        var d = new Date();
        var params = "?pluginVersion=" + this.pluginVersion +
            "&pingTime=" + (this.pamPingTime / 1000) +
            "&totalBytes=" + totalBytes +
            "&referer=" + encodeURIComponent(referer) +
            "&user=" + this.bandwidth.username +
            "&properties=" + encodeURIComponent(JSON.stringify(youboraData.getProperties())) +
            "&live=" + isLive +
            "&transcode=" + transcode +
            "&system=" + this.system +
            "&resource=" + encodeURIComponent(resource) +
            "&duration=" + duration;

        params += this.getExtraParamsUrl(youboraData.getExtraParams());
        if (youboraData.isBalanced) {
            params += "&isBalanced=1";
        } else {
            params += "&isBalanced=0";
        }
        if (youboraData.hashTitle) {
            params += "&hashTitle=true";
        } else {
            params += "&hashTitle=false";
        }
        if (youboraData.getCDN() != "") {
            params += "&cdn=" + youboraData.getCDN();
        }
        if (youboraData.getISP() != "") {
            params += "&isp=" + youboraData.getISP();
        }
        if (youboraData.getIP() != "") {
            params += "&ip=" + youboraData.getIP();
        }

        params += "&isResumed=" + this.wasResumed;

        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamStartUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.START, params);
        }

        if (youboraData.getResumeEnabled()) {
            var context = this;
            youboraData.log("YouboraCommunication :: Resume :: Enabled");
            this.sendPlayTimeStatus();
            this.resumeInterval = setInterval(function () {
                context.sendPlayTimeStatus();
            }, 6000);
        }

        this.startSent = true;
        this.lastPingTime = d.getTime();

    } catch (error) {
        youboraData.log("YouboraCommunication :: sendStart :: Error: " + error);
    }

};

YouboraCommunication.prototype.sendError = function (errorCode, message) {
    try {
        var params = "";

        if (typeof errorCode != "undefined"  && parseInt(errorCode) >= 0) {
            params = "?errorCode=" + errorCode + "&msg=" + message;
        }else{
            params = "?errorCode=9000&msg=" + message;
        }

        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamErrorUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.ERROR, params);
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendErrorWithParameters = function (errorCode, message, totalBytes, referer, properties, isLive, resource, duration, transcode) {
    try {
        if (typeof errorCode == "undefined"  || parseInt(errorCode) < 0) {
            errorCode=9000;
        }

        var params = "?errorCode=" + errorCode + "&msg=" + message;
        params += this.createParamsUrl(totalBytes, referer,  isLive, resource, duration);

        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamErrorUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.ERROR, params);
        }

    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

//Same as error with parameters but with the player
YouboraCommunication.prototype.sendAdvancedError = function (errorCode, player, message, totalBytes, referer, properties, isLive, resource, duration, transcode) {
    try {
        var params = "?errorCode=" + encodeURIComponent(errorCode) + "&msg=" + encodeURIComponent(message);
        params += "&player="+player;
        params += this.createParamsUrl(totalBytes, referer,  isLive, resource, duration);

        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamErrorUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.ERROR, params);
        }
    } catch (err) {
       youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.createParamsUrl = function (totalBytes, referer,  isLive, resource, duration) {
    try {
        var transcode = youboraData.getTransaction();
        if (duration == undefined || duration == "undefined") {
            duration = 0;
        }
        var d = new Date();
        var params = "&pluginVersion=" + this.pluginVersion +
                "&pingTime=" + (this.pamPingTime / 1000) +
                "&totalBytes=" + totalBytes +
                "&referer=" + encodeURIComponent(referer) +
                "&user=" + this.bandwidth.username +
                "&properties=" + encodeURIComponent(JSON.stringify(youboraData.getProperties())) +
                "&live=" + isLive +
                "&transcode=" + transcode +
                "&system=" + this.system +
                "&resource=" + encodeURIComponent(resource) +
                "&duration=" + duration;

        params = params + this.getExtraParamsUrl(youboraData.getExtraParams());

        if (youboraData.isBalanced) {
            params += "&isBalanced=1";
        } else {
            params += "&isBalanced=0";
        }
        if (youboraData.hashTitle) {
            params += "&hashTitle=true";
        } else {
            params += "&hashTitle=false";
        }
        if (youboraData.getCDN() != "") {
            params += "&cdn=" + youboraData.getCDN();
        }
        if (youboraData.getISP() != "") {
            params += "&isp=" + youboraData.getISP();
        }
        if (youboraData.getIP() != "") {
            params += "&ip=" + youboraData.getIP();
        }

        return params;
    } catch (err) {
       youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }

    return "";
};

YouboraCommunication.prototype.sendPingTotalBytes = function (totalBytes, currentTime) {
    try {
        if (this.startSent == false) {
            return;
        }
        if (currentTime > 0) {
            this.currentTime = currentTime;
        }
        var d = new Date();

        if (this.lastPingTime != 0) {
            this.diffTime = d.getTime() - this.lastPingTime;
        }
        this.lastPingTime = d.getTime();

        var params = "?diffTime=" + this.diffTime +
            "&totalBytes=" + totalBytes +
            "&pingTime=" + (this.pamPingTime / 1000) +
            "&dataType=0" +
            "&time=" + currentTime;

        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamPingUrl, params, true);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.PING, params);
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendPingTotalBitrate = function (bitrate, currentTime) {
    try {
        if (this.startSent == false) {
            return;
        }
        if (currentTime > 0) {
            this.currentTime = currentTime;
        }
        var d = new Date();

        if (this.lastPingTime != 0) {
            this.diffTime = d.getTime() - this.lastPingTime;
        }
        this.lastPingTime = d.getTime();

        var params = "?diffTime=" + this.diffTime +
            "&bitrate=" + bitrate +
            "&pingTime=" + (this.pamPingTime / 1000) +
            "&time=" + currentTime;

        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamPingUrl, params, true);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.PING, params);
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendJoin = function (currentTime, joinTimeDuration) {
    try {
        if (currentTime > 0) {
            this.currentTime = currentTime;
        }

        var params = "?eventTime=" + currentTime + "&time=" + joinTimeDuration;

        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamJoinTimeUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.JOIN, params);
        }

    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendJoinWithMediaDuration = function (currentTime, joinTimeDuration, mediaDuration) {
    try {
        if (currentTime > 0) {
            this.currentTime = currentTime;
        }

        var params = "?eventTime=" + currentTime + "&time=" + joinTimeDuration + "&mediaDuration=" + mediaDuration;

        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamJoinTimeUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.JOIN, params);
        }

    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendBuffer = function (currentTime, bufferTimeDuration) {
    try {
        if (this.startSent == false) {
            return;
        }
        if (currentTime > 0) {
            this.currentTime = currentTime;
        }
        try{
            if(currentTime < 10 && youboraData.getLive()){
                currentTime=10;
            }
        }catch(err){

        }
        var params = null;
        params = "?time=" + currentTime + "&duration=" + bufferTimeDuration;
        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamBufferUnderrunUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.BUFFER, params);
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendAds = function (currentTime, adsTimeDuration) {
    try { 
        if (this.startSent == false) {
            return;
        }
        if (currentTime > 0) {
            this.currentTime = currentTime;
        }

        var params = "?time=" + currentTime + "&duration=" + adsTimeDuration;
        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamAdsUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.ADS, params);
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendSeek = function (currentTime, seekTimeDuration) {
    try {
        if (this.startSent == false) {
            return;
        }
        if (currentTime > 0) {
            this.currentTime = currentTime;
        }
        try{
            if(currentTime < 10 && youboraData.getLive()){
                currentTime=10;
            }
        }catch(err){

        }
        var params = null;
        params = "?time=" + currentTime + "&duration=" + seekTimeDuration;
        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamSeekUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.SEEK, params);
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendResume = function () {
    try {
        if (this.startSent == false) {
            return;
        }
        var params = "";
        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamResumeUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.RESUME, params);
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendPause = function () {
    try {
        if (this.startSent == false) {
            return;
        }
        var params = "";
        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamPauseUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.PAUSE, params);
        }
        if (youboraData.getResumeEnabled()) {
            this.sendPlayTimeStatus();
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.sendStop = function () {
    try {
        if (this.startSent == false) {
            return;
        }
        this.currentTime = 0;
        if (youboraData.getResumeEnabled()) {
            this.sendPlayTimeStatus();
        }
        clearInterval(this.resumeInterval);

        var params = "?diffTime=" + this.diffTime;
        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamStopUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.STOP, params);
        }
        this.reset();
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

//Sends stop without affecting the data in resume. This is done
//because in case we close the play exiting the page instead of reaching the
//end of the video, we want the resume to keep its previous status
YouboraCommunication.prototype.sendStopResumeSafe = function () {
    try {
        if (this.startSent == false) {
            return;
        }
        clearInterval(this.resumeInterval);

        var params = "?diffTime=" + this.diffTime;
        if (this.canSendEvents && this.cdnNodeHostReady()) {
            this.sendAnalytics(this.pamStopUrl, params, false);
        } else {
            this.addEventToQueue(YouboraCommunicationEvents.STOP, params);
        }
        this.reset();
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.addEventToQueue = function (eventType, params) {
    try {
        var niceCommunicationObject = new YouboraCommunicationURL(eventType, params);
        this.eventQueue.push(niceCommunicationObject);
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.checkConcurrencyWork = function () {
    try {
        var mainContext = this;
        var cCode = youboraData.getConcurrencyCode();
        var cAccount = youboraData.getAccountCode();
        var cService = youboraData.getConcurrencyService();
        var cSession = youboraData.getConcurrencySessionId();
        var cMaxCount = youboraData.getConcurrencyMaxCount();
        var cUseIP = youboraData.getConcurrencyIpMode();
        var urlDataWithCode = "";

        cService = this.protocol + cService.split("//")[1];
        
        if (youboraData.getConcurrencyEnabled()) {
            var context = this;
            if (cUseIP) {
                this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
                this.xmlHttp.addEventListener("load", function (httpEvent) {
                    context.validateConcurrencyResponse(httpEvent);
                }, false);
                urlDataWithCode = cService + "?concurrencyCode=" + cCode +
                    "&accountCode=" + cAccount +
                    "&concurrencyMaxCount=" + cMaxCount +
                    "&random=" + Math.random();
                this.xmlHttp.open("GET", urlDataWithCode, true);
                this.xmlHttp.send();
            } else {
                this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
                this.xmlHttp.addEventListener("load", function (httpEvent) {
                    context.validateConcurrencyResponse(httpEvent);
                }, false);
                urlDataWithCode = cService + "?concurrencyCode=" + cCode +
                    "&accountCode=" + cAccount +
                    "&concurrencySessionId=" + cSession +
                    "&concurrencyMaxCount=" + cMaxCount +
                    "&random=" + Math.random();
                this.xmlHttp.open("GET", urlDataWithCode, true);
                this.xmlHttp.send();
            }
            youboraData.log("YouboraCommunication :: HTTP Concurrency Request :: " + urlDataWithCode);
        } else {
            youboraData.log("YouboraCommunication :: HTTP Concurrency Request :: " + urlDataWithCode);
        }

    } catch (err) {
        youboraData.log("YouboraCommunication :: startConcurrencyWork :: Disabled in data.");
    }
};

YouboraCommunication.prototype.validateConcurrencyResponse = function (httpEvent) {
    try {
        if (httpEvent.target.readyState == 4) {
            var mainContext = this;
            var response = httpEvent.target.response;
            if (response == "1") {
                this.sendError(14000, "CC_KICK");
                var cRedirect = youboraData.getConcurrencyRedirectUrl();
                if (typeof cRedirect == "function") {
                    youboraData.log("YouboraCommunication :: Concurrency :: Executed function");
                    cRedirect();
                } else {
                    youboraData.log("YouboraCommunication :: Concurrency :: 1 :: Redirecting to: " + cRedirect);
                    window.location = cRedirect;
                }
            } else if (response == "0") {
                youboraData.log("YouboraCommunication :: Concurrency :: 0 :: Continue...");
            } else {
                youboraData.log("YouboraCommunication :: Concurrency :: Empty response... stoping validation.");
                clearInterval(this.concurrencyTimer);
            }
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: validateConcurrencyResponse :: Error: " + err);
    }
};

YouboraCommunication.prototype.enableConcurrency = function () {
    try {
        youboraData.setConcurrencyEnabled(true);
        var context = this;
        clearInterval(this.concurrencyTimer);
        this.concurrencyTimer = setInterval(function () {
            context.checkConcurrencyWork();
        }, 10000);
        this.checkConcurrencyWork();
        youboraData.log("YouboraCommunication :: enableConcurrency :: Concurrency is now enabled");
    } catch (err) {
        clearInterval(this.resumeInterval);
        youboraData.log("YouboraCommunication :: enableConcurrency :: Error: " + err);
    }
};

YouboraCommunication.prototype.disableConcurrency = function () {
    try {
        youboraData.setConcurrencyEnabled(false);
        clearInterval(this.concurrencyTimer);
        youboraData.log("YouboraCommunication :: disableConcurrency :: Concurrency is now disabled");
    } catch (err) {
        clearInterval(this.resumeInterval);
        youboraData.log("YouboraCommunication :: disableConcurrency :: Error: " + err);
    }
};

YouboraCommunication.prototype.loadAnalytics = function (httpEvent) {
    var mainContext = this;
    try {
        if (httpEvent.target.readyState == 4) {

            youboraData.log("YouboraCommunication :: Loaded XML FastData");
            var response = httpEvent.target.responseXML;
            var pamUrl;
            try {
                pamUrl = response.getElementsByTagName("h")[0].childNodes[0].nodeValue;
            } catch (error) {
                youboraData.log("YouboraCommunication :: loadAnalytics :: Invalid Fast-Data Response!");
            }

            if ((pamUrl != undefined) && (pamUrl != "")) {
                this.pamBufferUnderrunUrl = this.protocol + pamUrl + "/bufferUnderrun";
                this.pamSeekUrl = this.protocol + pamUrl + "/seek";
                this.pamJoinTimeUrl = this.protocol + pamUrl + "/joinTime";
                this.pamStartUrl = this.protocol + pamUrl + "/start";
                this.pamStopUrl = this.protocol + pamUrl + "/stop";
                this.pamPauseUrl = this.protocol + pamUrl + "/pause";
                this.pamResumeUrl = this.protocol + pamUrl + "/resume";
                this.pamPingUrl = this.protocol + pamUrl + "/ping";
                this.pamErrorUrl = this.protocol + pamUrl + "/error";
                this.pamAdsUrl = this.protocol + pamUrl + "/ads";
            }

            try {
                this.pamCode = response.getElementsByTagName("c")[0].childNodes[0].nodeValue;
                this.pamCodeOrig = this.pamCode;
                this.pamPingTime = response.getElementsByTagName("pt")[0].childNodes[0].nodeValue * 1000;
                this.isXMLReceived = true;
                this.enableAnalytics = true;
                youboraData.log("YouboraCommunication :: Mandatory :: Analytics Enabled");
            } catch (err) {
                this.enableAnalytics = false;
                youboraData.log("YouboraCommunication :: Mandatory :: Analytics Disabled");
            }

            // Balance Fastdata Override
            try {
                this.enableBalancer = response.getElementsByTagName("b")[0].childNodes[0].nodeValue;
                if (this.enableBalancer == 1) {
                    this.enableBalancer = true;
                    youboraData.log("YouboraCommunication :: Mandatory :: Balancer Enabled");
                } else {
                    this.enableBalancer = false;
                    youboraData.log("YouboraCommunication :: Mandatory :: Balancer Disabled");
                }
            } catch (err) {
                youboraData.log("YouboraCommunication :: Mandatory :: Balancer Disabled");
                this.enableBalancer = false;
            }

            // Can send events
            if (youboraData.enableAnalytics) {
                this.canSendEvents = true;
            }

            if (((pamUrl != undefined) && (pamUrl != "")) && ((this.pamCode != undefined) && (this.pamCode != ""))) {
                this.fastDataValid = true;
            }

            this.sendEventsFromQueue();

            // Debug
            try {
                mainContext.debug = response.getElementsByTagName("db")[0].childNodes[0].nodeValue;
            } catch (err) {}

            try {
                mainContext.debugHost = response.getElementsByTagName("dh")[0].childNodes[0].nodeValue;
            } catch (err) {
                mainContext.debugHost = "";
            }

            if (mainContext.debugHost.length > 0) {
                youboraData.log("YouboraCommunication :: replaceConsoleEvents :: Binding to: " + this.debugHost);
                this.replaceConsoleEvents();
                youboraData.setDebug(true);
            }

            // Get Original chunk from HLS, or get NodeHost/NodeType
            this.resourceTreatment();

            if (youboraData.concurrencyProperties.enabled && this.fastDataValid) {
                this.checkConcurrencyWork();
            }
        }

    } catch (error) {
        youboraData.log("YouboraCommunication :: loadAnalytics :: Error: " + error);
    }
};

YouboraCommunication.prototype.cPing = function () {
    try {
        var context = this;
        this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
        this.xmlHttp.context = this;
        this.xmlHttp.addEventListener("load", function (httpEvent) {
            this.context.loadAnalytics(httpEvent);
        }, false);
        var urlDataWithCode = this.service + "/data?system=" + this.system + "&pluginVersion=" + this.pluginVersion + "&targetDevice=" + this.targetDevice + "&outputformat=" + this.outputFormat;
        this.xmlHttp.open("GET", urlDataWithCode, true);
        this.xmlHttp.send();
        youboraData.log("YouboraCommunication :: HTTP Request :: " + urlDataWithCode);
    } catch (err) {
        youboraData.log("YouboraCommunication :: cPing :: Erro: " + err);
    }
};

YouboraCommunication.prototype.replaceConsoleEvents = function () {
    try {
        var classContext = this;
        console = {
            log: function (data) {
                try {
                    var time = new Date();
                    var timeStamp = "[" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]";
                    var xmlhttp;
                        xmlhttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
                    
                    xmlhttp.open("GET", classContext.debugHost + encodeURIComponent(timeStamp) + " |> " + data);
                    xmlhttp.send();
                } catch (err) {}
            }
        };
        youboraData.log("YouboraCommunication :: replaceConsoleEvents :: Done ::");
    } catch (err) {
        youboraData.log("YouboraCommunication :: replaceConsoleEvents :: Error: " + err);
    }
};

YouboraCommunication.prototype.sendEventsFromQueue = function () {
    try {
        if (this.canSendEvents && this.cdnNodeHostReady()) {
            var niceCommunicationObject = this.eventQueue.shift();
            var eventURL;
            var eventType;
            var params = niceCommunicationObject.getParams();
            while (niceCommunicationObject != null) {
                eventType = niceCommunicationObject.getEventType();
                if (eventType == YouboraCommunicationEvents.START) {
                    eventURL = this.pamStartUrl;
                } else if (eventType == YouboraCommunicationEvents.JOIN) {
                    eventURL = this.pamJoinTimeUrl;
                } else if (eventType == YouboraCommunicationEvents.BUFFER) {
                    eventURL = this.pamBufferUnderrunUrl;
                } else if (eventType == YouboraCommunicationEvents.SEEK) {
                    eventURL = this.pamSeekUrl;
                } else if (eventType == YouboraCommunicationEvents.PAUSE) {
                    eventURL = this.pamPauseUrl;
                } else if (eventType == YouboraCommunicationEvents.RESUME) {
                    eventURL = this.pamResumeUrl;
                } else if (eventType == YouboraCommunicationEvents.PING) {
                    eventURL = this.pamPingUrl;
                } else if (eventType == YouboraCommunicationEvents.STOP) {
                    eventURL = this.pamStopUrl;
                } else if (eventType == YouboraCommunicationEvents.ERROR) {
                    eventURL = this.pamErrorUrl;
                }
                if (eventURL != null) {
                    this.sendAnalytics(eventURL, params, false);
                }
                niceCommunicationObject = this.eventQueue.shift();
            }
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.getBalancerUrls = function (url, callback) {
    var mainContext = this;
    this.balancedUrlsCallback = callback;
    if (!youboraData.enableBalancer) {
        mainContext.balancedUrlsCallback(false);
    } else {

        if (typeof youboraData != "undefined") {

            var service = youboraData.getBalanceService();
            var balanceType = youboraData.getBalanceType();
            var zoneCode = youboraData.getBalanceZoneCode();
            var originCode = youboraData.getBalanceOriginCode();
            var systemCode = youboraData.getAccountCode();
            var token = youboraData.getBalanceToken();
            var pluginVersion = this.pluginVersion;
            var niceNVA = youboraData.getBalanceNVA();
            var niceNVB = youboraData.getBalanceNVB();
            var isLive = youboraData.getLive();

            try {
                this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
                this.xmlHttp.context = this;
                var urlDataWithCode = service + "?type=" + balanceType +
                    "&systemcode=" + systemCode +
                    "&zonecode=" + zoneCode +
                    "&session=" + this.pamCode +
                    "&origincode=" + originCode +
                    "&resource=" + encodeURIComponent(url) +
                    "&niceNva=" + niceNVA +
                    "&niceNvb=" + niceNVB +
                    "&live=" + isLive +
                    "&token=" + youboraData.getBalanceToken();

                try {
                    if (isLive == true) {
                        urlDataWithCode += "&live=true";
                    }
                } catch (e) {}

                this.xmlHttp.addEventListener("load", function (httpEvent) {
                    var obj = httpEvent.target.response.toString();
                    var objJSON = "";
                    var error = false;
                    try {
                        objJSON = JSON.parse(obj);
                    } catch (e) {
                        error = true;
                    }
                    if (error == false) {
                        try {
                            var returnArray = [];
                            var indexCount = 0;
                            for (varindex in obj) {
                                try {
                                    indexCount++;
                                    returnArray[index] = objJSON[indexCount]['URL'];
                                } catch (e) {}
                            }
                            mainContext.balancedUrlsCallback(returnArray);
                        } catch (e) {
                            mainContext.balancedUrlsCallback(false)
                        }
                    } else {
                        mainContext.balancedUrlsCallback(false)
                    }
                }, false);
                this.xmlHttp.open("GET", urlDataWithCode, true);
                this.xmlHttp.send();
                youboraData.log("YouboraCommunication :: HTTP GetBalancerUrls Request :: " + urlDataWithCode);
            } catch (err) {
                youboraData.log("YouboraCommunication :: getBalancerUrls :: Error: " + err);
            }
        }
    }
};

YouboraCommunication.prototype.getBalancedResource = function (path, callback, referer) {
    if (!youboraData.enableBalancer) {
        mainContext.balancedCallback(false);
    } else {
        this.balancedCallback = callback;
        var mainContext = this;
        var service = youboraData.getBalanceService();
        var balanceType = youboraData.getBalanceType();
        var zoneCode = youboraData.getBalanceZoneCode();
        var originCode = youboraData.getBalanceOriginCode();
        var systemCode = youboraData.getAccountCode();
        var token = youboraData.getBalanceToken();
        var pluginVersion = this.pluginVersion;
        var niceNVA = youboraData.getBalanceNVA();
        var niceNVB = youboraData.getBalanceNVB();
        var isLive = youboraData.getLive();
        this.resourcePath = path;
        try {
            this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
            this.xmlHttp.context = this;
            var urlDataWithCode = service + "?type=" + balanceType +
                "&systemcode=" + systemCode +
                "&session=" + this.pamCode +
                "&zonecode=" + zoneCode +
                "&origincode=" + originCode +
                "&resource=" + encodeURIComponent(path) +
                "&niceNva=" + niceNVA +
                "&niceNvb=" + niceNVB +
                "&token=" + youboraData.getBalanceToken();

            try {
                if (isLive == true) {
                    urlDataWithCode += "&live=true";
                }
            } catch (e) {}


            this.xmlHttp.addEventListener("load", function (httpEvent) {
                var obj = httpEvent.target.response.toString();
                var objJSON = "";
                var error = false;
                try {
                    objJSON = JSON.parse(obj);
                } catch (err) {
                  
                    error = true;
                }
                if (error == false) {
                    youboraData.extraParams.param13 = true;
                    mainContext.balancedCallback(objJSON);
                } else {
                    mainContext.balancedCallback(false)
                }
            }, false);
            this.xmlHttp.open("GET", urlDataWithCode, true);
            this.xmlHttp.send();
            youboraData.log("YouboraCommunication :: HTTP Balance Request :: " + urlDataWithCode);
        } catch (err) {
            youboraData.log("YouboraCommunication :: getBalancedResource :: Error: " + err);
        }
    }
};

YouboraCommunication.prototype.validateBalanceResponse = function (httpEvent) {
    try {
        if (httpEvent.target.readyState == 4) {
           
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: validateBalanceResponse :: Error: " + err);
    }
};

YouboraCommunication.prototype.sendAnalytics = function (url, data, hasResponse) {
    var mainContext = this;
    try {
        if (this.canSendEvents && this.fastDataValid) {
            this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
            this.xmlHttp.context = this;

            if (hasResponse) {
                this.xmlHttp.addEventListener("load", function (httpEvent) {
                    this.context.parseAnalyticsResponse(httpEvent);
                }, false);
                this.xmlHttp.addEventListener("error", function () {
                    this.context.sendAnalyticsFailed();
                }, false);
            } else {
                this.xmlHttp.addEventListener("load", function (httpEvent) {
                    this.context.parseAnalyticsResponse(httpEvent);
                }, false);
                this.xmlHttp.addEventListener("error", function () {
                    this.context.sendAnalyticsFailed();
                }, false);
            }

            var urlDataWithCode="";
            if(data != ""){
                urlDataWithCode = url + data + "&code=" + this.pamCode + "&random=" + Math.random();
            }else{
                urlDataWithCode = url + "?code=" + this.pamCode + "&random=" + Math.random();
            }
            if(url.indexOf( this.pamStartUrl ) != -1 && this.nodeHostDataStart.host != "" && this.nodeHostDataStart.type != "") {
                urlDataWithCode += "&nodeHost=" + this.nodeHostDataStart.host + "&nodeType=" + this.nodeHostDataStart.type;  
            }

            youboraData.log("YouboraCommunication :: HTTP Request :: " + urlDataWithCode);
            this.xmlHttp.open("GET", urlDataWithCode, true);
            this.xmlHttp.send();
        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: Error Msg: " + err);
    }
};

YouboraCommunication.prototype.parseAnalyticsResponse = function (httpEvent) {
    try {
        if (httpEvent.target.readyState == 4) {

        }
    } catch (err) {
        youboraData.log("YouboraCommunication :: parseAnalyticsResponse :: Error: " + err);
    }
};

YouboraCommunication.prototype.sendAnalyticsFailed = function () {
    try {
        youboraData.log("YouboraCommunication :: Failed communication with nQs Service");
    } catch (err) {
        youboraData.log("YouboraCommunication :: sendAnalyticsFailed :: Error: " + err);
    }
};

YouboraCommunication.prototype.updateCode = function () {
    try {
        this.pamCodeCounter++;
        this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter;
    } catch (err) {
        youboraData.log("YouboraCommunication :: updateCode :: Error: " + err);
    }
};

YouboraCommunication.prototype.reset = function () {
    try {
        this.lastPingTime = 0;
        this.diffTime = 0;
        this.startSent = false;
        this.nodeHostDataStart.host = "";
        this.nodeHostDataStart.type = "";
        this.cdnNodeDataSendRequest = false;
        this.cdnNodeDataRequestFinished = false;
        this.checkM3U8 = false;
        this.updateCode();
    } catch (err) {
        youboraData.log("YouboraCommunication :: reset Error: " + err);
    }
};

YouboraCommunication.prototype.getResourcePath = function (href) {
    //Standard methos as getting the path name from an url
    //may not work with files with extension not http
    var pathWithDomain = href.split("//")[1];
    var startPathIndex = pathWithDomain.indexOf("/");
    var resourcePath = pathWithDomain.substring(startPathIndex, href.length);
    return resourcePath;

};

YouboraCommunication.prototype.getExtraParamsUrl = function (extraParams) {

    var params = "";

    if (extraParams != undefined) {
        if ((extraParams['extraparam1'] != undefined))
            params += "&param1=" + extraParams['extraparam1'];
        if ((extraParams['extraparam2'] != undefined))
            params += "&param2=" + extraParams['extraparam2'];
        if ((extraParams['extraparam3'] != undefined))
            params += "&param3=" + extraParams['extraparam3'];
        if ((extraParams['extraparam4'] != undefined))
            params += "&param4=" + extraParams['extraparam4'];
        if ((extraParams['extraparam5'] != undefined))
            params += "&param5=" + extraParams['extraparam5'];
        if ((extraParams['extraparam6'] != undefined))
            params += "&param6=" + extraParams['extraparam6'];
        if ((extraParams['extraparam7'] != undefined))
            params += "&param7=" + extraParams['extraparam7'];
        if ((extraParams['extraparam8'] != undefined))
            params += "&param8=" + extraParams['extraparam8'];
        if ((extraParams['extraparam9'] != undefined))
            params += "&param9=" + extraParams['extraparam9'];
        if ((extraParams['extraparam10'] != undefined))
            params += "&param10=" + extraParams['extraparam10'];
    }

    return params;
};

YouboraCommunication.prototype.informEvent = function (event) {
    var nqsDebugCall = "http://nqs5.pam.nice264.com:8991/playerEvent";
    time = new Date().getTime();
    code = this.pamCode;
    var parameters = "?code="+code+"&time="+time+"&eventType="+event;
    var url = nqsDebugCall + parameters;


    this.xmlHttp = this.createXMLHttpRequest(); // new XMLHttpRequest();
    this.xmlHttp.context = this;

    youboraData.log("YouboraCommunication :: HTTP Request :: " + url);
    this.xmlHttp.open("GET", url, true);
    this.xmlHttp.send();
}

YouboraCommunicationURL.prototype.getParams = function () {
    return this.params;
};

YouboraCommunicationURL.prototype.getEventType = function () {
    return this.eventType;
};




function YouboraCommunicationURL(eventType, params) {
    this.params = params;
    this.eventType = eventType;
}

var YouboraCommunicationEvents = {
    START: 0,
    JOIN: 1,
    BUFFER: 2,
    PING: 3,
    PAUSE: 4,
    RESUME: 5,
    STOP: 6,
    ERROR: 7,
    SEEK: 8
};