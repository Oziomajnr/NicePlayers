/*
 * YouboraCommunication
 * Copyright (c) 2014 NicePeopleAtWork
 * Author: Lluís Campos Beltran
 * Version: 3.1.0
 *  - Full Revision
 */
var SmartPlugin = {
  // General
  debug: true,
  isLive: youboraData.getLive(),
  bandwidth: {
    username: youboraData.getUsername(),
    interval: 6000
  },
  targetDevice: "CHROMECAST",
  pluginName: "CHROMECAST",
  pluginVersion: "1.4.3.1.4_CHROMECAST",
  initDone: 0,
  // Balancer
  balancing: youboraData.enableBalancer,
  balanceObject: "",
  balanceIndex: 1,
  // Media
  mediaEvents: {
    BUFFER_BEGIN: 1,
    BUFFER_END: 0,
    JOIN_SEND: 2
  },
  videoPlayer: undefined,
  urlResource: undefined,
  pingTimer: undefined,
  apiClass: undefined,
  currentTime: 0,
  duration: 0,
  // Triggers
  isStreamError: false,
  isBuffering: false,
  isStartSent: false,
  isJoinSent: false,
  isPaused: false,
  previousElapsedTime: 0,
  bufferTimeBegin: 0,
  joinTimeBegin: 0,
  joinTimeEnd: 0,
  manager: {},
  originalResource: "",
  isChangingVideo: false,
  lastCallToBufferCheck: 0,
  checkBufferInterval: "",
  lastSeekInitTime: 0,
  googleMediaPlayer: undefined,
  getResource: function() {
    SmartPlugin.urlResource = SmartPlugin.videoPlayer.currentSrc;
    if (SmartPlugin.googleMediaPlayer !== undefined) {
      SmartPlugin.urlResource = SmartPlugin.googleMediaPlayer.getHost().url
    }
    return SmartPlugin.urlResource;
  },
  setGoogleMediaPlayer: function(googleMediaPlayer) {
    if (googleMediaPlayer !== undefined) {
      SmartPlugin.googleMediaPlayer = googleMediaPlayer;
      SmartPlugin.urlResource = SmartPlugin.googleMediaPlayer.getHost().url
      clientDefinedCallback = SmartPlugin.googleMediaPlayer.getHost().onError;
      SmartPlugin.googleMediaPlayer.getHost().onError = function(errorCode, reqStatus) {
        clientDefinedCallback(errorCode, reqStatus);
        var errorMsg = "";
        switch (errorCode) {
          case cast.player.api.ErrorCode.NETWORK:
            errorMsg = "NETWORK";
            break;
          case cast.player.api.ErrorCode.MANIFEST:
            errorMsg = "MANIFEST";
            break;
          case cast.player.api.ErrorCode.PLAYBACK:
            errorMsg = "PLAYBACK";
            break;
          case cast.player.api.ErrorCode.MEDIAKEYS:
            errorMsg = "MEDIAKEYS";
            break;
        }
        SmartPlugin.reportError(errorCode, errorMsg);
      }


    }
  },
  disableGoogleMediaPlayer: function() {
    SmartPlugin.googleMediaPlayer = undefined;
  },
  Init: function(mediaPlayer) //optional argument to work with google media player library
    {
      try {
        console.log("PLUGINS INIT !!");
        if (SmartPlugin.debug) {
          console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init ::");
        }

        SmartPlugin.initDone = true;
        if (mediaPlayer !== undefined) {
          SmartPlugin.googleMediaPlayer = mediaPlayer;
        }
        SmartPlugin.startPlugin();
      } catch (error) {
        if (SmartPlugin.debug) {
          console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Init :: Error: " + error);
        }
        spLoaded = false;
      }
    },
  startPlugin: function() {
    try {
      try {
        SmartPlugin.videoPlayer = document.getElementsByTagName('video')[0];
        SmartPlugin.duration = SmartPlugin.videoPlayer.duration;
        if (SmartPlugin.debug) {
          console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: HTML5 <video> found!");
        }
        SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);

        try {

        } catch (e) {
          console.log(' ERROR TYPE: ' + e);
        }

        SmartPlugin.bindEvents();
      } catch (error) {
        if (SmartPlugin.debug) {
          console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: No <video> found!");
        }
        spLoaded = false;
      }
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: startPlugin :: Error: " + error);
      }
      spLoaded = false;
    }
  },
  bindEvents: function() {
    try {
      SmartPlugin.checkBufferInterval = setTimeout(SmartPlugin.checkBufferLastTimeExec, 500);
      var playerEvents = ["canplay", "playing", "waiting", "timeupdate", "ended", "play", "pause", "error", "abort", "seeking", "seeked", "loadstart", "ratechange", "stalled"];

      for (elem in playerEvents) {
        SmartPlugin.videoPlayer.addEventListener(playerEvents[elem], function(e) {
          SmartPlugin.checkPlayState(e);
        }, false);
      }

      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Events atached correctly!");
      }
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: bindEvents :: Error: " + error);
      }
    }
  },
  checkBufferLastTimeExec: function() {
    if (SmartPlugin.googleMediaPlayer === undefined) {
      if (SmartPlugin.lastCallToBufferCheck > 0) {
        if (new Date().getTime() - SmartPlugin.lastCallToBufferCheck >= 500 && SmartPlugin.isPaused == false) {
          SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
          SmartPlugin.isBuffering = true;
        }
      }
      SmartPlugin.checkBufferInterval = setTimeout(SmartPlugin.checkBufferLastTimeExec, 100);
    }
  },
  getCurrentBitRate: function() {
    var bitrate = -1;
    try {
      bitrate = SmartPlugin.videoPlayer.webkitVideoDecodedByteCount;
    } catch (e) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Bitrate :: Error: " + error);
      }
    }
    if (bitrate == undefined) {
      bitrate = -1;
    }
    return bitrate;
  },
  getCurrentBitRateMediaPlayer: function() {
    var bitrate = -1;
    try {
      if (SmartPlugin.googleMediaPlayer !== undefined) {
        protocol = SmartPlugin.googleMediaPlayer.getStreamingProtocol();
        for (var c = 0; c < protocol.getStreamCount(); c++) {
          streamInfo = protocol.getStreamInfo(c)
          if (streamInfo.mimeType === 'video/mp4' ||
            streamInfo.mimeType === 'video/mp2t') {
            var videoLevel = protocol.getQualityLevel(c);
            bitrate = streamInfo.bitrates[videoLevel];
          }
        }
      }
    } catch (e) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Bitrate :: Error: " + error);
      }
    }
    if (bitrate == undefined) {
      bitrate = -1;
    }
    return bitrate;
  },
  reportError: function(errorCode, errorMsg) {
    try {

      if (SmartPlugin.urlResource == "" || SmartPlugin.urlResource === undefined) {
        SmartPlugin.urlResource = SmartPlugin.getResource();
      }

      SmartPlugin.isStreamError = true;
      SmartPlugin.checkBuffering();
      clearInterval(SmartPlugin.pingTimer);
      SmartPlugin.apiClass.sendAdvancedError(errorCode, SmartPlugin.targetDevice, errorMsg, 0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
      SmartPlugin.reset();
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: error :: Error: " + error);
      }
    }
    SmartPlugin.isChangingVideo = false;
  },
  checkPlayState: function(e) {
    if (SmartPlugin.debug) {
      if (e.type != "timeupdate") {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: checkPlayState :: " + e.type);
      }
    }
    switch (e.type) {
      case "timeupdate":
        try {
          SmartPlugin.duration = SmartPlugin.videoPlayer.duration;
          SmartPlugin.urlResource = SmartPlugin.getResource();
          SmartPlugin.currentTime = SmartPlugin.videoPlayer.currentTime;

          if (SmartPlugin.currentTime > 0) {
            if (SmartPlugin.previousElapsedTime != SmartPlugin.videoPlayer.currentTime) {
              SmartPlugin.checkBuffering();
            }

            if (!SmartPlugin.isJoinSent) {
              SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
            }
            SmartPlugin.previousElapsedTime = SmartPlugin.videoPlayer.currentTime;
          }
        } catch (error) {
          if (SmartPlugin.debug) {
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: timeupdate :: Error: " + error);
          }
        }
        break;

      case "play":
        try {
          SmartPlugin.urlResource = SmartPlugin.getResource();

          SmartPlugin.duration = SmartPlugin.videoPlayer.duration;

          if (SmartPlugin.originalResource == "") {
            SmartPlugin.originalResource = SmartPlugin.videoPlayer.currentSrc;
          }


          if (SmartPlugin.urlResource != "") {

            if (SmartPlugin.balancing && SmartPlugin.apiClass.enableBalancer) {
              //youboraData.setBalancedResource(true);

              if (SmartPlugin.isPaused) {
                SmartPlugin.apiClass.sendResume();
                SmartPlugin.isPaused = false;
              }

              if (SmartPlugin.balanceObject == "") {
                var path = SmartPlugin.apiClass.getResourcePath(SmartPlugin.urlResource);
                SmartPlugin.apiClass.getBalancedResource(path, function(obj) {
                  SmartPlugin.setBalancedResource(obj);
                });
              } else {
                if (!SmartPlugin.isChangingVideo) {
                  SmartPlugin.balanceIndex++;
                  SmartPlugin.refreshBalancedResource();
                }
              }
            } else {
              youboraData.setBalancedResource(false);
              /*
              if (!SmartPlugin.isStartSent) {
                SmartPlugin.apiClass.sendStart(0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
                SmartPlugin.setPing();
                SmartPlugin.isStartSent = true;
                if (!SmartPlugin.isJoinSent) {
                  SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
                }
              }
              */
              if (SmartPlugin.isPaused) {
                SmartPlugin.apiClass.sendResume();
                SmartPlugin.isPaused = false;
              }
            }
          }
        } catch (error) {
          if (SmartPlugin.debug) {
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: play :: Error: " + error);
          }
        }
        break;

      case "pause":
        try {
          if (SmartPlugin.googleMediaPlayer !== undefined) {
            //Check if player getState underflow is true
            var pauseCausedByBuffer = SmartPlugin.googleMediaPlayer.getState().underflow;
            console.log("USING MPL underflow, value=" + pauseCausedByBuffer);
            if (pauseCausedByBuffer) {
              SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
              SmartPlugin.isBuffering = true;
            } else {
              if (SmartPlugin.isStartSent) {
                SmartPlugin.apiClass.sendPause();
              }
              SmartPlugin.isPaused = true;
            }
          } else {
            SmartPlugin.checkBuffering();
            if (SmartPlugin.isStartSent) {
              SmartPlugin.apiClass.sendPause();
            }
            SmartPlugin.isPaused = true;
          }
        } catch (error) {
          if (SmartPlugin.debug) {
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: pause :: Error: " + error);
          }
        }
        break;

      case "ended":
        try {
          SmartPlugin.checkBuffering();
          SmartPlugin.reset();
        } catch (error) {
          if (SmartPlugin.debug) {
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: ended :: Error: " + error);
          }
        }
        break;

      case "error":

        if (SmartPlugin.googleMediaPlayer === undefined) {
          try {

            if (SmartPlugin.urlResource == "" || SmartPlugin.urlResource === undefined) {
              SmartPlugin.urlResource = SmartPlugin.getResource();
            }

            if (youboraData.getBalanceEnabled() && SmartPlugin.apiClass.enableBalancer && SmartPlugin.balancing == false) {
              if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: playerErrfor :: Balancing...");
              }
              SmartPlugin.isStreamError = true;
              //SmartPlugin.apiClass.sendErrorWithParameters("131" + SmartPlugin.getBalancerErrorCount()-1, "CDN_PLAY_FAILURE", 0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration);
              SmartPlugin.apiClass.sendAdvancedError("131" + SmartPlugin.getBalancerErrorCount() - 1, SmartPlugin.targetDevice, "CDN_PLAY_FAILURE", 0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
              SmartPlugin.balanceIndex++;
              SmartPlugin.refreshBalancedResource();
            } else {
              SmartPlugin.isStreamError = true;
              SmartPlugin.checkBuffering();
              clearInterval(SmartPlugin.pingTimer);
              //SmartPlugin.apiClass.sendError( 3001 , ");
              SmartPlugin.apiClass.sendAdvancedError(3001, SmartPlugin.targetDevice, "PLAY_FAILURE", 0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
              SmartPlugin.reset();
            }
          } catch (error) {
            if (SmartPlugin.debug) {
              console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: error :: Error: " + error);
            }
          }
          SmartPlugin.isChangingVideo = false;
        }

        break;

      case "loadstart":
        SmartPlugin.reset();
        SmartPlugin.duration = SmartPlugin.videoPlayer.duration;
        SmartPlugin.urlResource = SmartPlugin.getResource();
        SmartPlugin.currentTime = SmartPlugin.videoPlayer.currentTime;
        if (!SmartPlugin.isStartSent) {
          SmartPlugin.apiClass.sendStart(0, window.location.href, "", youboraData.getLive(), SmartPlugin.urlResource, SmartPlugin.duration);
          SmartPlugin.setPing();
          SmartPlugin.isStartSent = true;
          if (!SmartPlugin.isJoinSent) {
            SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
          }
        }
        break;

      case "abort":
        SmartPlugin.reset();
        break;

      case "waiting":

        try {
          if (!SmartPlugin.seeking) {
            SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_BEGIN);
            SmartPlugin.isBuffering = true;
          }
        } catch (error) {
          if (SmartPlugin.debug) {
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: waiting :: Error: " + error);
          }
        }

        break;

      case "playing":
        try {
          SmartPlugin.checkBuffering();
          if (!SmartPlugin.isJoinSent) {
            SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
          }
        } catch (error) {
          if (SmartPlugin.debug) {
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: playing :: Error: " + error);
          }
        }
        break;

      case "seeking":
        SmartPlugin.seeking = true;
        SmartPlugin.lastSeekInitTime = new Date().getTime();
        break;

      case "seeked":
        SmartPlugin.seeking = false;
        break;
    }
  },
  getBalancerErrorCount: function() {
    if (SmartPlugin.balanceIndex < 10) {
      return "0" + SmartPlugin.balanceIndex;
    } else if (SmartPlugin.balanceIndex > 10) {
      return SmartPlugin.balanceIndex;
    } else {
      return "00";
    }
  },
  refreshBalancedResource: function() {
    try {
      if (typeof SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'] != "undefined") {
        SmartPlugin.videoPlayer.currentSrc = SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL'];
        SmartPlugin.videoPlayer.setAttribute("src", SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL']);
        SmartPlugin.videoPlayer.load();
        SmartPlugin.videoPlayer.play();
      } else {
        if (SmartPlugin.debug) {
          console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancer :: Error :: End of mirrors. Load Original");
        }
        SmartPlugin.videoPlayer.currentSrc = SmartPlugin.originalResource;
        SmartPlugin.videoPlayer.setAttribute("src", SmartPlugin.originalResource);
        SmartPlugin.videoPlayer.load();
        SmartPlugin.videoPlayer.play();
        SmartPlugin.balancing = false;

      }
    } catch (error) {

      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancer :: Error :: End of mirrors error:" + error + ",  Load Original ");
      }
      SmartPlugin.videoPlayer.currentSrc = SmartPlugin.originalResource;
      SmartPlugin.videoPlayer.setAttribute("src", SmartPlugin.originalResource);
      SmartPlugin.videoPlayer.load();
      SmartPlugin.videoPlayer.play();
      SmartPlugin.balancing = false;

    }
    SmartPlugin.isChangingVideo = true;
  },
  setBalancedResource: function(obj) {
    try {
      if (obj != false) {
        var indexCount = 0;
        for (index in obj) {
          indexCount++;
        }
        SmartPlugin.balanceObject = obj;
        SmartPlugin.balanceObject['' + (indexCount + 1) + ''] = new Object();
        SmartPlugin.balanceObject['' + (indexCount + 1) + '']['URL'] = youboraData.getMediaResource();

        if (typeof obj['1']['URL'] != "undefined") {
          if (SmartPlugin.debug) {
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balance Current Resource  :: " + SmartPlugin.urlResource);
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balance Priority Resource :: " + obj['1']['URL']);
          }
          if (obj['1']['URL'] != SmartPlugin.urlResource) {
            if (SmartPlugin.debug) {
              console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancing :: " + obj['1']['URL']);
            }
            try {
              SmartPlugin.videoPlayer.currentSrc = obj['1']['URL'];
              youboraData.setCDN(obj['1']['CDN_CODE']);
              SmartPlugin.videoPlayer.setAttribute("src", obj['1']['URL']);
              SmartPlugin.videoPlayer.load();
              SmartPlugin.videoPlayer.play();
            } catch (error) {
              if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancing :: Error While Changing Media: " + error);
              }
              SmartPlugin.videoPlayer.currentSrc = SmartPlugin.urlResource;
              SmartPlugin.videoPlayer.setAttribute("src", SmartPlugin.balanceObject[SmartPlugin.balanceIndex]['URL']);
              SmartPlugin.videoPlayer.load();
              SmartPlugin.videoPlayer.play();
            }
          } else {
            if (SmartPlugin.debug) {
              console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balancer :: Same Resource");
            }
            SmartPlugin.videoPlayer.load();
            SmartPlugin.videoPlayer.play();
          }
        } else {
          if (SmartPlugin.debug) {
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Invalid balance object");
          }
          SmartPlugin.videoPlayer.load();
          SmartPlugin.videoPlayer.play();
        }
      } else {
        SmartPlugin.balancing = false;
        if (SmartPlugin.debug) {
          console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Balance unavailable with current parameters");
        }
        /*SmartPlugin.videoPlayer.load();
        SmartPlugin.videoPlayer.play();
        */
      }
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBalancedResource :: Error: " + error);
      }
    }
  },
  checkBuffering: function() {
    try {
      if (SmartPlugin.isBuffering) {
        if (SmartPlugin.isStartSent) {
          console.log("checkBuffering=BUFFER_END>");
          SmartPlugin.setBufferEvent(SmartPlugin.mediaEvents.BUFFER_END);
        }
        SmartPlugin.isBuffering = false;
      }

      SmartPlugin.lastCallToBufferCheck = new Date().getTime();
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: checkBuffering :: Error: " + error);
      }
    }
  },
  setBufferEvent: function(bufferState) {
    try {

      var d = new Date();
      var bufferTimeEnd = 0;
      var bufferTimeTotal = 0;

      switch (bufferState) {
        case SmartPlugin.mediaEvents.BUFFER_BEGIN:
          if (SmartPlugin.isBuffering == false) {
            SmartPlugin.bufferTimeBegin = d.getTime();
            //console.log("BEGIN BUFFER @ "+SmartPlugin.bufferTimeBegin);
            if (SmartPlugin.joinTimeBegin == 0) {
              SmartPlugin.joinTimeBegin = d.getTime();
            }
          }

          break;

        case SmartPlugin.mediaEvents.BUFFER_END:

          bufferTimeEnd = d.getTime();
          bufferTimeTotal = bufferTimeEnd - SmartPlugin.bufferTimeBegin;

          console.log("BUFFER BEGIN @" + SmartPlugin.bufferTimeBegin + "BEGIN END @ " + bufferTimeEnd + " LAST SEEK @" + SmartPlugin.lastSeekInitTime);

          if (SmartPlugin.isJoinSent == false) {
            var joinTimeTotal = d.getTime() - SmartPlugin.joinTimeBegin;
            if (SmartPlugin.isStartSent) {
              SmartPlugin.apiClass.sendJoin(SmartPlugin.currentTime, joinTimeTotal);
              SmartPlugin.isJoinSent = true;
            }
            if (SmartPlugin.debug) {
              console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: sendJoin");
            }
          } else {
            var currentTime = SmartPlugin.currentTime;
            if (currentTime == 0 && SmartPlugin.isLive) {
              currentTime = 10;
            }
            if (SmartPlugin.bufferTimeBegin - SmartPlugin.lastSeekInitTime > 2000) {
              if (SmartPlugin.isStartSent && bufferTimeTotal > 350) {
                SmartPlugin.apiClass.sendBuffer(currentTime, bufferTimeTotal);
              }
              if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: sendBuffer");
              }
            } else {
              if (SmartPlugin.debug) {
                console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: buffer due to seek do not report");
              }
            }

          }

          break;
      }
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setBufferEvent :: Error: " + error);
      }
    }
  },
  setPing: function() {
    try {
      SmartPlugin.pingTimer = setTimeout(function() {
        SmartPlugin.ping();
      }, SmartPlugin.apiClass.getPingTime());
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setPing :: Error: " + error);
      }
    }
  },
  ping: function() {
    try {
      clearTimeout(SmartPlugin.pingTimer);
      SmartPlugin.pingTimer = null;
      SmartPlugin.setPing();
      if (SmartPlugin.isStartSent) {
        if (SmartPlugin.googleMediaPlayer === undefined) {
          SmartPlugin.apiClass.sendPingTotalBytes(SmartPlugin.getCurrentBitRate(), SmartPlugin.currentTime);
        } else {
          SmartPlugin.apiClass.sendPingTotalBitrate(SmartPlugin.getCurrentBitRateMediaPlayer(), SmartPlugin.currentTime);
        }
      }
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Pîng :: Error: " + error);
      }
    }
  },
  defineWatch: function() {
    try {
      if (!Object.prototype.watch) {
        Object.defineProperty(Object.prototype, "watch", {
          enumerable: false,
          configurable: true,
          writable: false,
          value: function(prop, handler) {
            var oldval = this[prop],
              newval = oldval,
              getter = function() {
                return newval;
              },
              setter = function(val) {
                oldval = newval;
                return newval = handler.call(this, prop, oldval, val);
              };
            if (delete this[prop]) {
              Object.defineProperty(this, prop, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
              });
            }
          }
        });
      }
      if (!Object.prototype.unwatch) {
        Object.defineProperty(Object.prototype, "unwatch", {
          enumerable: false,
          configurable: true,
          writable: false,
          value: function(prop) {
            var val = this[prop];
            delete this[prop];
            this[prop] = val;
          }
        });
      }
      SmartPlugin.setWatch();
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: defineWatch :: Error: " + error);
      }
    }
  },
  setWatch: function() {
    try {
      var varsToWatch = ["balanceObject", "balanceIndex", "videoPlayer", "urlResource", "currentTime", "isStreamError", "isBuffering", "isStartSent", "isJoinSent", "isPaused", "bufferTimeBegin", "joinTimeBegin", "joinTimeEnd"];
      for (elem in varsToWatch) {
        if (typeof varsToWatch[elem] != "function") {
          SmartPlugin.watch(varsToWatch[elem], function(id, oldVal, newVal) {
            console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: Watcher :: [" + id + "] From: [" + oldVal + "] To: [" + newVal + "]");
            return newVal;
          });
        }
      }
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: setWatch :: Error: " + error);
      }
    }
  },
  reset: function() {
    try {
      clearTimeout(SmartPlugin.pingTimer);
      clearTimeout(SmartPlugin.checkBufferInterval);
      SmartPlugin.apiClass.sendStop();
      SmartPlugin.currentTime = 0;
      SmartPlugin.urlResource = "";
      SmartPlugin.isLive = youboraData.getLive();
      SmartPlugin.duration = 0;
      SmartPlugin.previousElapsedTime = 0;
      SmartPlugin.isPaused = false;
      SmartPlugin.isStartSent = false;
      SmartPlugin.bufferTimeBegin = 0;
      SmartPlugin.isJoinSent = false;
      SmartPlugin.joinTimeBegin = 0;
      SmartPlugin.joinTimeEnd = 0;
      SmartPlugin.pingTimer = "";
      SmartPlugin.balanceIndex = 1;
      SmartPlugin.balanceObject = "";
      SmartPlugin.lastCallToBufferCheck = 0;
      SmartPlugin.lastSeekInitTime = 0;
      SmartPlugin.isBuffering = false;
      //SmartPlugin.googleMediaPlayer = undefined;
      SmartPlugin.apiClass = new YouboraCommunication(youboraData.getAccountCode(), youboraData.getService(), SmartPlugin.bandwidth, SmartPlugin.pluginVersion, SmartPlugin.targetDevice);
      SmartPlugin.checkBufferInterval = setTimeout(SmartPlugin.checkBufferLastTimeExec, 500);
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: reset :: Error: " + error);
      }
    }
  },
  sendError: function(msg, errorCode) {
    try {
      SmartPlugin.isStreamError = true;
      SmartPlugin.checkBuffering();
      clearInterval(SmartPlugin.pingTimer);
      SmartPlugin.apiClass.sendAdvancedError(errorCode, SmartPlugin.targetDevice, msg, 0, window.location.href, "", SmartPlugin.isLive, SmartPlugin.urlResource, SmartPlugin.duration, youboraData.getTransaction());
      SmartPlugin.reset();
    } catch (error) {
      if (SmartPlugin.debug) {
        console.log("SmartPlugin :: " + SmartPlugin.pluginName + " :: sendError :: Error: " + error);
      }
    }
  }
}