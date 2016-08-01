var TVA = {
    deBugReporter: false,
    connectivityTimer: null,
    online: true,
    device: "ps3",
    year: 2007,
    zoomMargins: {
        min: 0.8,
        max: 1.05,
        step: 0.05
    },
    language: null,
    country: null,
    onHover: "",
    onFocus: "",
    connectionCheck: true,
    connectionPlaying: false,
    callbackFunction: null,
    parse: true,
    activeInput: false,
    popupActive: true,
    popupConnNoTitle: "No Network Connection",
    popupConnNoText: "Please check your internet connection and re-launch this application",
    popupConnBadTitle: "Network Instability",
    popupConnBadText: "Your network connection had become disconnected. Some network services may need to be restarted",
    popupConnBack: "Press return to close",
    appName: "##appName##",
    engineId: "##engineId##",
    connectionAlertInterval: 0,
    backgroundTime: 0
};
TVA.init = function(a) {
    try {
        var c = document.getElementById("deviceInfo");
        if (c) {
            TVA.deviceInfo = c
        }
    } catch (d) {}
    if (a) {
        if (a.connectionCheck && a.connectionCheck == false) {
            TVA.connectionCheck = false
        }
    }
    if (TVA.connectionCheck) {
        TVA.connectivityTimer = window.setInterval("TVA.testConnectivity();", 5000)
    }
    TVA.setNetworkPopupLang();
    TVA.onShowEvent()
};
TVA.getInfo = function() {
    return JSON.stringify({
        dev: TVA.device,
        appver: window.platform.appversion,
        ua: navigator.userAgent
    })
};
TVA.quit = function() {
    if (window.platform.ver > 0) {
        return
    }
    if (TVA_Player) {
        TVA_Player.deinit()
    }
    window.close()
};
TVA.onShowEvent = function() {
    try {
        ScreenSaver.enable()
    } catch (b) {}
};
TVA.keyDownTimeoutFn = null;
TVA.keyDownEvt = null;
TVA.keyDown = function(d) {
    TVA.keyDownEvt = d;
    var c = d.keyCode;
    if (Debug.enabled == true && (View.actualPageIs(Home) || View.actualPageIs(VideoPlayer)) && (c == window.platform.keyCodes.KEY_L3)) {
        window.location.reload();
        return
    }
    c = TVA.checkKeys(c);
    if (c == 121) {
        c = 120
    }
    if (c != 122) {
        d.preventDefault()
    }
    if (TVA.activeInput) {
        TVA_Input.processKey(c)
    } else {
        if (TVA.online && !document.getElementById("connectionAlert")) {
            Main.keyDown(c)
        }
    }
    TVA.invalidate();
    TVA.keyDownEvt = null
};
TVA.invalidate = function(a) {
    if (TVA.OTT.DEVICETYPE == TVA.OTT.DEVICETYPE_BRAVIA) {
        clearTimeout(TVA.keyDownTimeoutFn);
        var b = 1500;
        if (a === true) {
            b = 10
        }
        TVA.keyDownTimeoutFn = setTimeout(function() {
            try {
                var c = Footer.element["left-controls"];
                if (c) {
                    if (c.hasClass("opaque099")) {
                        c.removeClass("opaque099")
                    } else {
                        c.addClass("opaque099")
                    }
                }
            } catch (d) {}
        }, b)
    }
};
TVA.handleReturn = function() {
    TVA.quit()
};
TVA.getDeviceId = function() {
    if (TVA.deviceInfo) {
        return TVA.deviceInfo.serialNumber
    } else {
        return null
    }
};
TVA.setHover = function(f) {
    try {
        if (TVA.onHover) {
            var h = document.getElementById(TVA.onHover);
            if (h) {
                if ($(h).hasClass("hover")) {
                    $(h).removeClass("hover")
                }
            }
        }
    } catch (g) {}
    TVA.onHover = f;
    var d = document.getElementById(f);
    if (d) {
        $(d).addClass("hover")
    }
};
TVA.offHover = function(d) {
    TVA.onHover = "";
    try {
        if (d) {
            var c = document.getElementById(d);
            if (c) {
                $(c).removeClass("hover")
            }
        }
    } catch (f) {}
};
TVA.isFocusable = function(b) {
    if (window.platform.ver == 0) {
        if (!b.hasOwnProperty("ottF0c1s")) {
            b.ottF0c1s = (b.nodeName == "INPUT" || b.nodeName == "SELECT" || b.nodeName == "TEXTAREA")
        }
        return b.ottF0c1s
    }
    return true
};
TVA.setFocus = function(d) {
    try {
        if (TVA.activeInput) {
            TVA_Input.exitInput(false)
        }
        var i = document.getElementById(TVA.onFocus);
        if (i) {
            if ($(i).hasClass("focus")) {
                $(i).removeClass("focus")
            }
        }
    } catch (h) {}
    TVA.onFocus = d;
    try {
        var g = document.getElementById(d);
        if (g) {
            var f = $(g);
            f.addClass("focus");
            if (TVA.isFocusable(g)) {
                f.focus()
            }
        }
    } catch (h) {}
};
TVA.offFocus = function(c) {
    TVA.onFocus = "";
    try {
        var f = document.getElementById(c);
        if (f) {
            var d = $(f);
            d.removeClass("focus");
            if (TVA.isFocusable(f)) {
                d.blur()
            }
        }
    } catch (g) {}
};
TVA.setLanguage = function(b) {
    TVA.language = b
};
TVA.getLanguage = function() {
    return "es"
};
TVA.getCountry = function() {
    if (TVA.deviceInfo && TVA.deviceInfo.tvCountry2) {
        return TVA.deviceInfo.tvCountry2
    } else {
        return null
    }
};
TVA.getTime = function() {
    return new Date(TVA.getEpoch()).toLocaleTimeString()
};
TVA.getDate = function() {
    return new Date(TVA.getEpoch()).toLocaleDateString()
};
TVA.getEpoch = function() {
    try {
        var c = TVA.deviceInfo.getSystemTime();
        return new Date(c.year, c.month, c.day, c.hour, c.minute, c.second)
    } catch (d) {
        return new Date().getTime()
    }
};
TVA.checkConnectivity = function() {
    if (TVA.deviceInfo) {
        return TVA.deviceInfo.net_isConnected
    } else {
        return true
    }
};
TVA.testConnectivity = function() {
    var e, c, h;
    var f = TVA.checkConnectivity();
    if (!TVA.online && !f && !document.getElementById("connectionAlert")) {
        TVA.online = true
    }
    if (TVA.online) {
        if (f) {} else {
            TVA.online = false;
            if (TVA.popupActive) {
                window.clearTimeout(TVA.connectionAlertInterval);
                $("#connectionAlert").remove();
                PopUp.hideIfVisible();
                e = document.createElement("div");
                c = document.createElement("div");
                h = document.createElement("div");
                h.textContent = TVA.popupConnNoText;
                h.style.color = "#AAA";
                h.style.textAlign = "center";
                c.textContent = TVA.popupConnNoTitle;
                c.style.color = "#EEE";
                c.style.textAlign = "center";
                e.style.position = "absolute";
                e.style.backgroundColor = "#111";
                e.style.fontSize = "24px";
                e.style.border = "5px solid #EEE";
                e.style.width = "675px";
                e.style.height = "85px";
                e.style.left = "303px";
                e.style.top = "316px";
                e.style.padding = "15px 0px 15px 0px";
                e.style.zIndex = 10000;
                e.id = "connectionAlert";
                e.appendChild(c);
                e.appendChild(h);
                document.getElementById("body").appendChild(e)
            }
            if (TVA_Player != null && (TVA_Player.getState() == TVA_Player.state.playing || TVA_Player.getState() == TVA_Player.state.buffering)) {
                this.connectionPlaying = true;
                TVA_Player.stop()
            }
            if (typeof Main.networkDown == "function") {
                Main.networkDown()
            }
        }
    } else {
        if (f) {
            window.clearTimeout(TVA.connectionAlertInterval);
            $("#connectionAlert").remove();
            PopUp.hideIfVisible();
            TVA.online = true;
            if (API.initialized == false) {
                API.authDevice(API.getStorefrontOps);
                if (typeof Main.networkUp == "function") {
                    Main.networkUp()
                }
                PopUp.showIfVisible();
                return
            }
            if (TVA.popupActive) {
                e = document.createElement("div");
                c = document.createElement("div");
                h = document.createElement("div");
                h.textContent = TVA.popupConnBadText;
                h.style.color = "#AAA";
                h.style.textAlign = "center";
                c.textContent = TVA.popupConnBadTitle;
                c.style.color = "#EEE";
                c.style.textAlign = "center";
                e.style.position = "absolute";
                e.style.backgroundColor = "#111";
                e.style.fontSize = "24px";
                e.style.border = "5px solid #EEE";
                e.style.width = "675px";
                e.style.height = "85px";
                e.style.left = "303px";
                e.style.top = "316px";
                e.style.padding = "15px 0px 15px 0px";
                e.style.zIndex = 10000;
                e.id = "connectionAlert";
                e.appendChild(c);
                e.appendChild(h);
                document.getElementById("body").appendChild(e)
            }
            var g = "";
            if (TVA_Player != null && this.connectionPlaying) {
                this.connectionPlaying = false;
                TVA.recoverFromNetworkError()
            } else {
                g = "if(View.actualPage!==PopUp)View.initActualPage(true);"
            }
            TVA.connectionAlertInterval = window.setTimeout("$('#connectionAlert').remove();PopUp.showIfVisible();" + g, 4000);
            if (typeof Main.networkUp == "function") {
                Main.networkUp()
            }
        } else {}
    }
};
TVA.recoverFromNetworkError = function() {
    setTimeout("View.loaderHide();View.previousPage();", 1)
};
TVA.putInnerHTML = function(c, d) {
    if (c) {
        c.innerHTML = d
    }
};
TVA.netUp = function() {};
TVA.netDown = function() {};
TVA.getJSONcors = function(f, h, g) {
    var j = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D"' + encodeURIComponent(f) + '"&format=json&callback=';
    TVA.callbackFunction = h;
    if (g) {
        TVA.parse = false
    }
    var i = document.createElement("script");
    i.type = "text/javascript";
    i.src = j + "TVA.responseCallback";
    document.getElementsByTagName("head")[0].appendChild(i)
};
TVA.responseCallback = function(f) {
    var e;
    if (TVA.parse) {
        e = JSON.parse(f.query.results.body.p)
    } else {
        e = f.query.results.body.p;
        TVA.parse = true
    }
    var d = TVA.callbackFunction;
    TVA.callbackFunction = null;
    d(e)
};
TVA.setNetworkPopupLang = function() {
    if ("es" == TVA.getLanguage()) {
        TVA.popupConnNoTitle = "Sin conexión a la red";
        TVA.popupConnNoText = "Por favor, compruebe su conexión a internet y vuelva a lanzar la aplicación";
        TVA.popupConnBadTitle = "Inestabilidad de la red";
        TVA.popupConnBadText = "Tu conexión a la red se ha desconectado. Algunos servicios de red pueden necesitar ser reiniciados";
        TVA.popupConnBack = "Pulse volver para cerrar este mensaje"
    } else {
        if ("fr" == TVA.getLanguage()) {
            TVA.popupConnNoTitle = "Pas de connexion r?seau";
            TVA.popupConnNoText = "S'il vous pla?t v?rifier votre connexion Internet et relancer cette application";
            TVA.popupConnBadTitle = "L'instabilit? du r?seau";
            TVA.popupConnBadText = "Votre connexion au r?seau a ?t? d?branch?. Certains services r?seau peut etre n?cessaire de red?marrer";
            TVA.popupConnBack = "Appuyez sur RETURN pour fermer"
        } else {
            if ("tr" == TVA.getLanguage()) {
                TVA.popupConnNoTitle = "Internet Baglantisi Bulunamadi";
                TVA.popupConnNoText = "L?tfen internet baglantinizi kontrol edin ve uygulamayi tekrar a?in";
                TVA.popupConnBadTitle = "Baglanti Hatasi";
                TVA.popupConnBadText = "Internet baglantisi kurulamadi. Bazi durumlarda baglanti servisini yeniden ba?latmaniz gerekebilir";
                TVA.popupConnBack = "Kapatmak i?in geri tu?una basin"
            } else {
                if ("pt" == TVA.getLanguage()) {
                    TVA.popupConnNoTitle = "Nenhuma liga?ao de rede";
                    TVA.popupConnNoText = "Por favor, verifique a liga?ao com a internet e relance esta aplica?ao";
                    TVA.popupConnBadTitle = "Instabilidade de rede";
                    TVA.popupConnBadText = "Houve problemas na liga?ao de rede. Alguns servi?os podem precisar de ser reiniciados";
                    TVA.popupConnBack = "Prima RETURN para fechar"
                } else {
                    if ("it" == TVA.getLanguage()) {
                        TVA.popupConnNoTitle = "Nessuna connessione di rete";
                        TVA.popupConnNoText = "Verifica la tua connessione di rete e rilancia questa applicazione";
                        TVA.popupConnBadTitle = "Rete instabile";
                        TVA.popupConnBadText = "La connessione di rete era scollegata. Potrebbe essere necessario riavviare alcuni servizi di rete";
                        TVA.popupConnBack = "Premi RETURN per chiudere"
                    }
                }
            }
        }
    }
};
TVA.setBackgroundStatus = function(b) {
    if (b == true) {
        if (View.actualPageIs(VideoPlayer)) {
            this.backgroundTime = Utils.now();
            VideoControls.pause()
        }
    } else {
        if (View.actualPageIs(VideoPlayer) && this.backgroundTime > 0) {
            var a = Utils.now();
            var c = 5;
            if (VideoPlayer.details.isLive && (a <= this.backgroundTime || a > this.backgroundTime + (c * 60 * 1000))) {
                if (View.actualPageIs(PopUp)) {
                    PopUp.deInitView()
                }
                if (View.actualPageIs(PopUp)) {
                    PopUp.deInitView()
                }
                View.previousPage()
            } else {
                VideoControls.play()
            }
            this.backgroundTime = 0
        } else {}
    }
};
var TVA_Player = {
    url: null,
    pluginMW: null,
    originalSource: null,
    player: null,
    height: 720,
    width: 1280,
    xPosition: 0,
    yPosition: 0,
    zoomFactor: 0,
    MIMEType: "",
    defaultMIMEAud: "audio/mpeg",
    defaultMIMEVid: "video/mp4",
    playPos: 0,
    defaultSkip: 10,
    mode: 0,
    active: false,
    preBufferMode: 0,
    avMode: 0,
    defaultLoading: false,
    avState: {
        video: 0,
        audio: 1
    },
    state: {
        stopped: 0,
        playing: 1,
        paused: 2,
        buffering: 4,
        connecting: 3,
        finished: 5,
        error: 6
    },
    headTimer: null,
    previousMode: -1,
    widevine: false,
    multipleVodAudioTracksDisabled: false,
    multipleLiveAudioTracksDisabled: false
};
TVA_Player.init = function(a) {
    if (!a) {
        a = {}
    }
    if (a.width) {
        TVA_Player.width = a.width
    }
    if (a.height) {
        TVA_Player.height = a.height
    }
    if (a.xPosition) {
        TVA_Player.xPosition = a.xPosition
    }
    if (a.yPosition) {
        TVA_Player.yPosition = a.yPosition
    }
    if (a.url) {
        TVA_Player.url = a.url
    }
    if (a.defaultSkip) {
        TVA_Player.defaultSkip = a.defaultSkip
    }
    if (a.MIMEType) {
        TVA_Player.MIMEType = a.MIMEType
    }
    if (a.defaultLoading) {
        TVA_Player.defaultLoading = a.defaultLoading
    }
    TVA_Player.zoomFactor = Utils.getZoom();
    TVA_Player.buildPlayer();
    if (!TVA_Player.player) {
        return false
    }
    if (a.avMode && a.avMode == "audio") {
        TVA_Player.readyAudio()
    } else {
        TVA_Player.readyVideo()
    }
    if (typeof playStateChanged != "function") {
        playStateChanged = function() {}
    }
    if (playStateChanged == TVA_Player.playStateChanged) {
        TVA_Player.playerPlayStateChanged = playStateChanged;
        playStateChanged = TVA_Player.playStateChanged
    }
    return true
};
TVA_Player.buildPlayer = function(b) {
    var a = document.getElementById("TVA_PlayerBox");
    if (a) {
        if (TVA_Player.player) {
            TVA_Player.player.Stop();
            TVA_Player.player = null
        }
        var c = document.getElementById("LGplayer");
        a.removeChild(c)
    } else {
        a = document.createElement("span");
        a.setAttribute("id", "TVA_PlayerBox");
        document.getElementById("body").appendChild(a)
    }
    if (b) {
        a.innerHTML = b
    } else {
        a.innerHTML = '<object data="" type="audio/mpeg" width="0" height="0" id="LGplayer" style="position:absolute; top:0px; left:0px;"></object>'
    }
    TVA_Player.player = document.getElementById("LGplayer");
    TVA_Player.widevine = false;
    TVA_Player.player.onPlayStateChange = TVA_Player.onPlayStateChange;
    TVA_Player.player.onBuffering = TVA_Player.onBuffering
};
TVA_Player.readyVideo = function() {
    TVA_Player.setHeight(TVA_Player.height);
    TVA_Player.setWidth(TVA_Player.width);
    TVA_Player.setXY(TVA_Player.xPosition, TVA_Player.yPosition);
    TVA_Player.avMode = 0;
    TVA_Player.player.setAttribute("type", TVA_Player.MIMEType ? TVA_Player.MIMEType : TVA_Player.defaultMIMEVid)
};
TVA_Player.readyAudio = function() {
    TVA_Player.setHeight(0);
    TVA_Player.setWidth(0);
    TVA_Player.setXY(0, 0);
    TVA_Player.avMode = 1;
    TVA_Player.player.setAttribute("type", TVA_Player.MIMEType ? TVA_Player.MIMEType : TVA_Player.defaultMIMEAud)
};
TVA_Player.setXY = function(b, a) {
    TVA_Player.xPosition = b;
    TVA_Player.yPosition = a;
    TVA_Player.player.style.position = "absolute";
    TVA_Player.player.style.left = b + "px";
    TVA_Player.player.style.top = a + "px";
    return true
};
TVA_Player.getWidth = function() {
    return TVA_Player.player.width
};
TVA_Player.setWidth = function(a) {
    TVA_Player.player.width = a;
    TVA_Player.width = a;
    return true
};
TVA_Player.getHeight = function() {
    return TVA_Player.player.height
};
TVA_Player.setHeight = function(a) {
    TVA_Player.player.height = a;
    TVA_Player.height = a;
    return true
};
TVA_Player.hide = function() {
    TVA_Player.active = false;
    TVA_Player.player.style.display = "none"
};
TVA_Player.show = function() {
    TVA_Player.player.style.display = "block";
    TVA_Player.active = true
};
TVA_Player.getURL = function() {
    return TVA_Player.url
};
TVA_Player.setURL = function(a) {
    TVA_Player.url = a;
    return true
};
TVA_Player.setVideoData = function(a) {
    TVA_Player.videoData = a;
    if (a.url) {
        TVA_Player.setURL(a.url)
    }
};
TVA_Player.getVideoData = function() {
    return TVA_Player.videoData
};
TVA_Player.play = function() {
    TVA_Player.player.videoData = TVA_Player.getVideoData();
    window.setTimeout(function() {
        TVA_Player.player.play(1)
    }, 100);
    return true
};
TVA_Player.stop = function() {
    return TVA_Player.player.stop()
};
TVA_Player.pause = function(a) {
    if (a) {
        return TVA_Player.player.play(0)
    } else {
        return TVA_Player.player.play(1)
    }
};
TVA_Player.forward = function(b) {
    b = b ? b : TVA_Player.defaultSkip;
    var a = TVA_Player.playPos + b > TVA_Player.getLength() ? TVA_Player.getLength() : TVA_Player.playPos + b;
    return TVA_Player.player.seek(a * 1000)
};
TVA_Player.backward = function(b) {
    b = b ? b : TVA_Player.defaultSkip;
    var a = TVA_Player.playPos - b < 0 ? 0 : TVA_Player.playPos - b;
    return TVA_Player.player.seek(a * 1000)
};
TVA_Player.seekTo = function(b) {
    var a = Math.floor((b / 100) * (TVA_Player.getLength()));
    return TVA_Player.player.seek(a * 1000)
};
TVA_Player.playStateChanged = function(c) {
    if (TVA_Player.defaultLoading) {
        var a = null;
        if (document.getElementById("loading_logo")) {
            a = document.getElementById("loading_logo")
        } else {
            a = document.createElement("img");
            a.setAttribute("id", "loading_logo");
            a.setAttribute("src", "TVA/images/loading.png");
            a.style.position = "absolute";
            a.style.zIndex = "99999";
            document.getElementById("body").appendChild(a)
        }
        if (c == 3 || c == 4) {
            var d = TVA_Player.yPosition + TVA_Player.height / 2 - 92;
            var b = TVA_Player.xPosition + TVA_Player.width / 2 - 100;
            a.style.top = d + "px";
            a.style.left = b + "px";
            a.style.display = "block"
        } else {
            a.style.display = "none"
        }
    }
    TVA_Player.playerPlayStateChanged(c)
};
TVA_Player.onBuffering = function() {
    if (typeof bufferingProgress == "function") {
        bufferingProgress("Not available")
    }
};
TVA_Player.onPlayStateChange = function() {
    TVA_Player.mode = TVA_Player.player.playState;
    if (TVA_Player.mode == 4) {
        TVA_Player.onBuffering()
    }
    if (TVA_Player.mode != TVA_Player.previousMode) {
        TVA_Player.previousMode = TVA_Player.mode
    } else {
        return
    }
    if (TVA_Player.mode == 1) {
        TVA_Player.headTimer = window.setInterval(function() {
            TVA_Player.setCurrentTime()
        }, 1000)
    } else {
        if (TVA_Player.headTimer != null) {
            TVA_Player.clearTimer()
        }
    }
    if (TVA_Player.mode == 6) {
        if (typeof playError == "function") {
            playError(TVA_Player.player.error)
        }
    } else {
        if (typeof playStateChanged == "function") {
            playStateChanged(TVA_Player.mode)
        }
    }
};
TVA_Player.getLength = function() {
    if (TVA_Player.player) {
        return Math.floor(TVA_Player.player.playTime / 1000)
    }
    return null
};
TVA_Player.getCurrentTime = function() {
    return Math.floor(TVA_Player.player.playPosition / 1000)
};
TVA_Player.setCurrentTime = function() {
    if (OTTAnalytics.updatingPlayTime == true) {
        return
    }
    TVA_Player.playPos = TVA_Player.getCurrentTime();
    if (typeof playHeadChanged == "function") {
        var a = TVA_Player.playPos;
        if (VideoPlayer.details.isLive) {
            a = Math.floor((Utils.now() - VideoPlayer.videoStartTime) / 1000)
        }
        playHeadChanged(a)
    }
};
TVA_Player.getAVState = function() {
    return TVA_Player.avMode
};
TVA_Player.getState = function() {
    return TVA_Player.mode
};
TVA_Player.deinit = function() {
    try {
        TVA_Player.lastAudioTrack = -1;
        if (TVA_Player.player) {
            TVA_Player.hide();
            try {
                TVA_Player.player.stop()
            } catch (b) {}
            TVA_Player.player = null
        }
        TVA_Player.clearTimer()
    } catch (a) {}
};
TVA_Player.clearTimer = function() {
    window.clearInterval(TVA_Player.headTimer);
    TVA_Player.headTimer = null;
    clearTimeout(window.platform.seekTimeout);
    window.platform.seekTimeout = null
};
TVA_Player.zoom = function() {
    TVA_Player.zoomFactor += 0.1;
    if (TVA_Player.zoomFactor >= 1.5) {
        TVA_Player.zoomFactor = Utils.getZoom()
    }
    platform.sendCommand({
        command: "setVideoPortalSize",
        ltx: -TVA_Player.zoomFactor,
        lty: TVA_Player.zoomFactor,
        rbx: TVA_Player.zoomFactor,
        rby: -TVA_Player.zoomFactor
    });
    return true
};
TVA_Player.checkAudioAndSubtitles = function() {
    setTimeout(function() {
        window.platform.sendCommand({
            command: "getSubtitleTracks"
        });
        window.platform.sendCommand({
            command: "getAudioTracks"
        })
    }, 50)
};
TVA_Player.setAudioInfo = function(b) {
    try {
        if (VideoPlayer.details.isLive && TVA_Player.multipleLiveAudioTracksDisabled == true) {
            TVA_Player.audio = {
                track: [],
                selected: 0
            };
            return ""
        } else {
            if (!VideoPlayer.details.isLive && TVA_Player.multipleVodAudioTracksDisabled == true) {
                TVA_Player.audio = {
                    track: [],
                    selected: 0
                };
                return ""
            }
        }
        TVA_Player.audio = b;
        if (View.actualPageIs(VideoPlayer) && TVA_Player.audio.track.length > 1) {
            VideoPlayer.setFooter()
        }
        if (TVA_Player.audio.track.length > 1) {
            if (TVA_Player.lastAudioTrack >= 0 && TVA_Player.lastAudioTrack < TVA_Player.audio.track.length) {
                return ("" + TVA_Player.audio.track[TVA_Player.lastAudioTrack]).toUpperCase()
            }
            return ("" + TVA_Player.audio.track[TVA_Player.audio.selected]).toUpperCase()
        }
    } catch (a) {}
    return ""
};
TVA_Player.setSubtitlesInfo = function(b) {
    try {
        TVA_Player.subtitles = b;
        if (View.actualPageIs(VideoPlayer) && TVA_Player.subtitles.track.length > 1) {
            VideoPlayer.setFooter()
        }
    } catch (a) {}
};
TVA_Player.getAudioTracks = function() {
    if (typeof TVA_Player.audio === "undefined") {
        TVA_Player.audio = {
            track: [],
            selected: 0
        }
    }
    return TVA_Player.audio
};
TVA_Player.getSubtitleTracks = function() {
    if (typeof TVA_Player.subtitles === "undefined") {
        TVA_Player.subtitles = {
            track: [],
            selected: 0
        }
    }
    return TVA_Player.subtitles
};
TVA_Player.lastAudioTrack = -1;
TVA_Player.setAudioTrack = function(a) {
    try {
        if (typeof a === "undefined") {
            a = TVA_Player.lastAudioTrack + 1
        }
        if (typeof a === "undefined" || a < 0 || a >= TVA_Player.audio.track.length) {
            a = TVA_Player.audio.selected + 1;
            if (a >= TVA_Player.audio.track.length) {
                a = 0
            }
            if (TVA_Player.audio.track[a] == TVA_Player.lastAudioTrack) {
                a++;
                if (a >= TVA_Player.audio.track.length) {
                    a = 0
                }
            }
        }
        var c = TVA_Player.audio.track[a];
        TVA_Player.audio.selected = a;
        TVA_Player.lastAudioTrack = a;
        window.platform.sendCommand({
            command: "setAudioTrack",
            audioTrack: c
        });
        var b = ("" + c).toUpperCase();
        setTimeout(function() {
            Alert.show("Audio: " + b, true, 6000)
        }, 1000);
        VideoPlayer.reloadVideo();
        return b
    } catch (d) {}
    return ""
};
TVA_Player.setSubtitleTrack = function(a) {
    try {
        if (typeof a === "undefined" || a < 0 || a > TVA_Player.subtitles.track.length) {
            a = TVA_Player.subtitles.selected + 1;
            if (a >= TVA_Player.subtitles.track.length) {
                a = 0
            }
        }
        TVA_Player.subtitles.selected = a;
        window.platform.sendCommand({
            command: "setSubtitleTrack",
            subtitleTrack: TVA_Player.subtitles.track[a]
        })
    } catch (b) {}
};
TVA_Player.getRealTime = function() {
    return videometrics.elapsed
};
(function() {
    function c(o, q) {
        var p = o[0],
            n = o[1],
            s = o[2],
            r = o[3];
        p = a(p, n, s, r, q[0], 7, -680876936);
        r = a(r, p, n, s, q[1], 12, -389564586);
        s = a(s, r, p, n, q[2], 17, 606105819);
        n = a(n, s, r, p, q[3], 22, -1044525330);
        p = a(p, n, s, r, q[4], 7, -176418897);
        r = a(r, p, n, s, q[5], 12, 1200080426);
        s = a(s, r, p, n, q[6], 17, -1473231341);
        n = a(n, s, r, p, q[7], 22, -45705983);
        p = a(p, n, s, r, q[8], 7, 1770035416);
        r = a(r, p, n, s, q[9], 12, -1958414417);
        s = a(s, r, p, n, q[10], 17, -42063);
        n = a(n, s, r, p, q[11], 22, -1990404162);
        p = a(p, n, s, r, q[12], 7, 1804603682);
        r = a(r, p, n, s, q[13], 12, -40341101);
        s = a(s, r, p, n, q[14], 17, -1502002290);
        n = a(n, s, r, p, q[15], 22, 1236535329);
        p = i(p, n, s, r, q[1], 5, -165796510);
        r = i(r, p, n, s, q[6], 9, -1069501632);
        s = i(s, r, p, n, q[11], 14, 643717713);
        n = i(n, s, r, p, q[0], 20, -373897302);
        p = i(p, n, s, r, q[5], 5, -701558691);
        r = i(r, p, n, s, q[10], 9, 38016083);
        s = i(s, r, p, n, q[15], 14, -660478335);
        n = i(n, s, r, p, q[4], 20, -405537848);
        p = i(p, n, s, r, q[9], 5, 568446438);
        r = i(r, p, n, s, q[14], 9, -1019803690);
        s = i(s, r, p, n, q[3], 14, -187363961);
        n = i(n, s, r, p, q[8], 20, 1163531501);
        p = i(p, n, s, r, q[13], 5, -1444681467);
        r = i(r, p, n, s, q[2], 9, -51403784);
        s = i(s, r, p, n, q[7], 14, 1735328473);
        n = i(n, s, r, p, q[12], 20, -1926607734);
        p = e(p, n, s, r, q[5], 4, -378558);
        r = e(r, p, n, s, q[8], 11, -2022574463);
        s = e(s, r, p, n, q[11], 16, 1839030562);
        n = e(n, s, r, p, q[14], 23, -35309556);
        p = e(p, n, s, r, q[1], 4, -1530992060);
        r = e(r, p, n, s, q[4], 11, 1272893353);
        s = e(s, r, p, n, q[7], 16, -155497632);
        n = e(n, s, r, p, q[10], 23, -1094730640);
        p = e(p, n, s, r, q[13], 4, 681279174);
        r = e(r, p, n, s, q[0], 11, -358537222);
        s = e(s, r, p, n, q[3], 16, -722521979);
        n = e(n, s, r, p, q[6], 23, 76029189);
        p = e(p, n, s, r, q[9], 4, -640364487);
        r = e(r, p, n, s, q[12], 11, -421815835);
        s = e(s, r, p, n, q[15], 16, 530742520);
        n = e(n, s, r, p, q[2], 23, -995338651);
        p = l(p, n, s, r, q[0], 6, -198630844);
        r = l(r, p, n, s, q[7], 10, 1126891415);
        s = l(s, r, p, n, q[14], 15, -1416354905);
        n = l(n, s, r, p, q[5], 21, -57434055);
        p = l(p, n, s, r, q[12], 6, 1700485571);
        r = l(r, p, n, s, q[3], 10, -1894986606);
        s = l(s, r, p, n, q[10], 15, -1051523);
        n = l(n, s, r, p, q[1], 21, -2054922799);
        p = l(p, n, s, r, q[8], 6, 1873313359);
        r = l(r, p, n, s, q[15], 10, -30611744);
        s = l(s, r, p, n, q[6], 15, -1560198380);
        n = l(n, s, r, p, q[13], 21, 1309151649);
        p = l(p, n, s, r, q[4], 6, -145523070);
        r = l(r, p, n, s, q[11], 10, -1120210379);
        s = l(s, r, p, n, q[2], 15, 718787259);
        n = l(n, s, r, p, q[9], 21, -343485551);
        o[0] = d(p, o[0]);
        o[1] = d(n, o[1]);
        o[2] = d(s, o[2]);
        o[3] = d(r, o[3])
    }

    function k(v, p, o, n, u, r) {
        p = d(d(p, v), d(n, r));
        return d((p << u) | (p >>> (32 - u)), o)
    }

    function a(p, o, v, u, n, r, q) {
        return k((o & v) | ((~o) & u), p, o, n, r, q)
    }

    function i(p, o, v, u, n, r, q) {
        return k((o & u) | (v & (~u)), p, o, n, r, q)
    }

    function e(p, o, v, u, n, r, q) {
        return k(o ^ v ^ u, p, o, n, r, q)
    }

    function l(p, o, v, u, n, r, q) {
        return k(v ^ (o | (~u)), p, o, n, r, q)
    }

    function j(q) {
        txt = "";
        var t = q.length,
            r = [1732584193, -271733879, -1732584194, 271733878],
            p;
        for (p = 64; p <= q.length; p += 64) {
            c(r, m(q.substring(p - 64, p)))
        }
        q = q.substring(p - 64);
        var o = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (p = 0; p < q.length; p++) {
            o[p >> 2] |= q.charCodeAt(p) << ((p % 4) << 3)
        }
        o[p >> 2] |= 128 << ((p % 4) << 3);
        if (p > 55) {
            c(r, o);
            for (p = 0; p < 16; p++) {
                o[p] = 0
            }
        }
        o[14] = t * 8;
        c(r, o);
        return r
    }

    function m(o) {
        var p = [],
            n;
        for (n = 0; n < 64; n += 4) {
            p[n >> 2] = o.charCodeAt(n) + (o.charCodeAt(n + 1) << 8) + (o.charCodeAt(n + 2) << 16) + (o.charCodeAt(n + 3) << 24)
        }
        return p
    }
    var h = "0123456789abcdef".split("");

    function f(q) {
        var p = "",
            o = 0;
        for (; o < 4; o++) {
            p += h[(q >> (o * 8 + 4)) & 15] + h[(q >> (o * 8)) & 15]
        }
        return p
    }

    function b(n) {
        for (var o = 0; o < n.length; o++) {
            n[o] = f(n[o])
        }
        return n.join("")
    }

    function g(n) {
        return b(j(n))
    }

    function d(o, n) {
        return (o + n) & 4294967295
    }
    if (g("hello") != "5d41402abc4b2a76b9719d911017c592") {
        function d(n, q) {
            var p = (n & 65535) + (q & 65535),
                o = (n >> 16) + (q >> 16) + (p >> 16);
            return (o << 16) | (p & 65535)
        }
    }
    window.md5 = g;
    testmd5 = function() {}
}());
(function() {
    window.platform = {
        id: "PS",
        ver: 3,
        backgroundTime: 0,
        deviceId: null,
        appversion: null,
        getPlaybackTimeResponsed: true,
        seekTimeout: null,
        init: function(b) {
            var a = this;
            window.accessfunction = function(c) {
                a.receiveCommandResponse(c)
            };
            clearTimeout(window.platform.seekTimeout);
            window.platform.seekTimeout = null;
            this.sendCommand({
                command: "dismissSplash"
            });
            document.body.style.backgroundColor = "transparent";
            this.onHwidCommandResponseReceived = function() {
                b();
                this.onHwidCommandResponseReceived = null
            };
            this.sendCommand({
                command: "appversion"
            });
            this.sendCommand({
                command: "hwid"
            });
            if (!window.external || !window.external.user) {
                b()
            }
        },
        getDeviceId: function() {
            if (!navigator.userAgent.toLowerCase().match(/playstation/)) {
                return "FOO"
            }
            return this.deviceId
        },
        log: function(a) {
            if (!Debug.enabled) {
                return
            }
            if (console && console.log) {
                console.log(a)
            }
            if (this.sendCommand) {
                this.sendCommand({
                    command: "logTTY",
                    msg: a
                })
            }
        },
        keyCodes: {
            KEY_LEFT: 37,
            KEY_RIGHT: 39,
            KEY_UP: 38,
            KEY_DOWN: 40,
            KEY_CIRCLE: 8,
            KEY_CROSS: 13,
            KEY_SQUARE: 32,
            KEY_TRIANGLE: 112,
            KEY_L1: 116,
            KEY_R1: 117,
            KEY_L2: 118,
            KEY_R2: 119,
            KEY_L3: 120,
            KEY_R3: 121,
            KEY_START: 114,
            KEY_SELECT: 115,
            KEY_PS: 131,
            KEY_TOUCHPAD: 135,
            KEY_ENTER: 43,
            KEY_RETURN: 27,
            KEY_RED: 132,
            KEY_GREEN: 133,
            KEY_YELLOW: 41,
            KEY_BLUE: 42,
            KEY_0: 96,
            KEY_1: 97,
            KEY_2: 98,
            KEY_3: 99,
            KEY_4: 100,
            KEY_5: 101,
            KEY_6: 102,
            KEY_7: 103,
            KEY_8: 104,
            KEY_9: 105,
            KEY_PLAY: 128,
            KEY_STOP: 129,
            KEY_PAUSE: 130,
            KEY_FAST_RW: 127,
            KEY_FAST_FW: 126,
            KEY_RW: 125,
            KEY_FF: 124,
            KEY_PREV: 122,
            KEY_NEXT: 123,
            KEY_TIME: 19,
            KEY_TOP_M: 36,
            KEY_POPUP_M: 18,
            KEY_AUDIO: 173,
            KEY_ANGLE: 45,
            KEY_SUBTITLE: 47,
            KEY_CLEAR: 12,
            KEY_DISPLAY: 44
        },
        sendCommand: function(d) {
            try {
                if (SmartPlugin && SmartPlugin.PS3CommandFunction && window.external) {
                    window.external.user = SmartPlugin.PS3CommandFunction;
                    SmartPlugin.PS3CommandFunction = null
                }
            } catch (c) {}
            if (window.external && window.external.user && JSON && JSON.stringify) {
                var b = JSON.stringify(d);
                if (d.command != "logTTY" && d.command != "getPlaybackTime") {
                    platform.log("Command sent: " + b)
                }
                var a = window.external.user(b);
                if (a === null) {
                    a = true
                }
                return a
            } else {
                if (d.command && d.command != "getPlaybackTime" && d.command != "logTTY") {
                    platform.log("PS3: Could not send command: " + d.command)
                }
                return null
            }
        },
        receiveCommandResponse: function(c) {
            if (!c.match(/getPlaybackTime/) && !c.match(/logTTY/)) {
                platform.log("PS3: " + c)
            }
            try {
                c = JSON.parse(c)
            } catch (g) {
                platform.log("PS3: Could not parse JSON command response...");
                return
            }
            var f = 0;
            var a = 0;
            var b = 0;
            var h = null;
            var j = [];
            switch (c.command) {
                case "playerStatusChange":
                    this.videoPlayer.state = c.playerState;
                    switch (c.playerState) {
                        case "buffering":
                            if (this.videoPlayer.events.waiting) {
                                this.videoPlayer.events.waiting()
                            }
                            if (this.videoPlayer.events.stalled) {
                                this.videoPlayer.events.stalled()
                            }
                            return;
                        case "endOfStream":
                            if (VideoPlayer.details.isLive) {
                                setTimeout("VideoPlayer.currentChannel();", 10);
                                return
                            }
                            this.videoPlayer.stop();
                            if (this.videoPlayer.latestPlaybackTimeData) {
                                this.videoPlayer.latestPlaybackTimeData.currentTime = this.videoPlayer.latestPlaybackTimeData.totalTime
                            }
                            if (this.videoPlayer.events.timeupdate) {
                                this.videoPlayer.events.timeupdate(this.videoPlayer.latestPlaybackTimeData)
                            }
                            if (this.videoPlayer.events.ended) {
                                this.videoPlayer.events.ended()
                            }
                            return;
                        case "paused":
                            if (this.videoPlayer.events.pause) {
                                this.videoPlayer.events.pause()
                            }
                            return;
                        case "playing":
                            if (this.videoPlayer.events.play) {
                                this.videoPlayer.events.play()
                            }
                            if (this.videoPlayer.pendingResumeTime1 > 0) {
                                this.videoPlayer.pendingResumeTime2 = this.videoPlayer.pendingResumeTime1;
                                this.videoPlayer.pendingResumeTime1 = 0;
                                if (window.platform.ver == 4) {
                                    a = this.videoPlayer.pendingResumeTime2;
                                    this.videoPlayer.pendingResumeTime2 = 0;
                                    this.videoPlayer.pendingResumeTime1 = 0;
                                    this.videoPlayer.pendingResumeTimePS4 = a
                                }
                                var l = this;
                                clearTimeout(window.platform.seekTimeout);
                                window.platform.seekTimeout = setTimeout(function() {
                                    if (l.videoPlayer.pendingResumeTime2 > 0) {
                                        var e = l.videoPlayer.pendingResumeTime;
                                        l.videoPlayer.pendingResumeTime = 0;
                                        platform.sendCommand({
                                            command: "setPlayTime",
                                            playTime: e
                                        })
                                    }
                                }, 1000)
                            } else {
                                if (this.videoPlayer.pendingResumeTime2 > 0) {
                                    a = this.videoPlayer.pendingResumeTime2;
                                    this.videoPlayer.pendingResumeTime2 = 0;
                                    this.videoPlayer.pendingResumeTime1 = 0;
                                    clearTimeout(window.platform.seekTimeout);
                                    window.platform.seekTimeout = null;
                                    setTimeout(function() {
                                        platform.sendCommand({
                                            command: "setPlayTime",
                                            playTime: a
                                        })
                                    }, 5)
                                } else {
                                    this.videoPlayer.pendingResumeTime2 = 0;
                                    this.videoPlayer.pendingResumeTime1 = 0
                                }
                            }
                            return;
                        case "stopped":
                            TVA_Player.clearTimer();
                            if (View.actualPage !== VideoPlayer) {
                                Header.hideMe(false);
                                $("#main-container").removeClass("hide-this");
                                $("#footer").removeClass("hide-this")
                            }
                            return
                    }
                    return;
                case "getSubtitleTracks":
                    h = c.subtitleTracks;
                    h = (typeof h === "string" && h.length > 0) ? h.split(",") : [];
                    for (f = 0; f < h.length; f++) {
                        if (h[f] == c.currentSubtitleTrack) {
                            b = f
                        }
                    }
                    TVA_Player.setSubtitlesInfo({
                        track: h,
                        selected: b
                    });
                    break;
                case "getAudioTracks":
                    h = c.audioTracks;
                    h = (typeof h === "string" && h.length > 0) ? h.split(",") : [];
                    for (f = 0; f < h.length; f++) {
                        if (h[f] == c.currentAudioTrack) {
                            b = f
                        }
                    }
                    TVA_Player.setAudioInfo({
                        track: h,
                        selected: b
                    });
                    break;
                case "playerError":
                case "playerStreamingError":
                    if (this.videoPlayer.events.error) {
                        this.videoPlayer.events.error()
                    }
                    this.videoPlayer.stop();
                    View.previousPage();
                    for (k in c) {
                        if (c.hasOwnProperty(k)) {
                            j.push(c[k])
                        }
                    }
                    PopMsg.show("error", 34, j.join(":"));
                    return;
                case "contentAvailable":
                    if (this.videoPlayer.events.canplay) {
                        this.videoPlayer.events.canplay()
                    }
                    if (TVA_Player.pendingSeek && typeof TVA_Player.pendingSeek === "number" && TVA_Player.pendingSeek > 0) {
                        this.videoPlayer.resumeTime = TVA_Player.pendingSeek
                    }
                    TVA_Player.pendingSeek = 0;
                    if (this.videoPlayer.resumeTime > 0 && !VideoPlayer.details.isLive) {
                        this.videoPlayer.pendingResumeTime1 = this.videoPlayer.resumeTime;
                        this.videoPlayer.pendingResumeTime2 = 0;
                        this.videoPlayer.pendingResumeTimePS4 = 0
                    } else {
                        this.videoPlayer.pendingResumeTime1 = 0;
                        this.videoPlayer.pendingResumeTime2 = 0;
                        this.videoPlayer.pendingResumeTimePS4 = 0
                    }
                    return;
                case "playerSubtitle":
                    return;
                case "getPlaybackTime":
                    window.platform.getPlaybackTimeResponsed = true;
                    if (this.videoPlayer.events.timeupdate && this.videoPlayer.state == "playing") {
                        if (this.videoPlayer.isSkipping) {
                            return
                        }
                        var d = {
                            currentTime: parseInt(c.elapsedTime),
                            totalTime: parseInt(c.totalTime)
                        };
                        if (this.videoPlayer.events.timeupdate) {
                            this.videoPlayer.events.timeupdate(d)
                        }
                        this.videoPlayer.latestPlaybackTimeData = d
                    }
                    if (this.videoPlayer.pendingResumeTimePS4 > 0) {
                        a = this.videoPlayer.pendingResumeTimePS4;
                        this.videoPlayer.pendingResumeTimePS4 = 0;
                        VideoControls.mouseover();
                        setTimeout(function() {
                            platform.sendCommand({
                                command: "setPlayTime",
                                playTime: a
                            })
                        }, 5)
                    }
                    return;
                case "setPlayTime":
                    if (this.videoPlayer.resumeTime) {
                        platform.sendCommand({
                            command: "play"
                        });
                        this.videoPlayer.resumeTime = null
                    }
                    return;
                case "networkStatusChange":
                    if (this.onCheckNetworkConnection) {
                        if (c.newState == "connected") {
                            this.onCheckNetworkConnection(true)
                        }
                        if (c.newState == "disconnected") {
                            this.onCheckNetworkConnection(false)
                        }
                    }
                    return;
                case "hwid":
                    if (c.hwid) {
                        this.deviceId = c.hwid
                    }
                    if (this.onHwidCommandResponseReceived) {
                        this.onHwidCommandResponseReceived()
                    }
                    return;
                case "appversion":
                    if (c.version) {
                        this.appversion = c.version
                    }
                    return;
                case "applicationStatusChange":
                    if (View.actualPageIs(PopUp) && (PopUp.type == "pairing-login" || PopUp.type == "pairing-alta")) {
                        if (Keyboard.isFocused) {
                            Keyboard.loseFocus(false)
                        }
                        return
                    }
                    if (window.platform.ver >= 4) {
                        if (c.applicationStatus == "background") {
                            Main.setBackgroundStatus(true)
                        } else {
                            if (c.applicationStatus == "foreground") {
                                Main.setBackgroundStatus(false)
                            }
                        }
                        return
                    }
                    break
            }
        },
        videoPlayer: {
            videoElement: null,
            currentUrl: null,
            init: function(a) {
                this.videoElement = a;
                return this.setPortalSize()
            },
            setPortalSize: function() {
                var a = Utils.getZoom();
                return platform.sendCommand({
                    command: "setVideoPortalSize",
                    ltx: -a,
                    lty: a,
                    rbx: a,
                    rby: -a
                })
            },
            play: function(c, b) {
                if (this.setPortalSize() === null) {
                    return null
                }
                var a = this;
                OTTspYoubora.play(c, function() {
                    a.playResponse(c, b)
                });
                return true
            },
            playResponse: function(c, a) {
                OTTAnalytics.checkPosition(0);
                this.isPaused = false;
                this.resumeTime = a || null;
                this.pendingResumeTime1 = 0;
                this.pendingResumeTime2 = 0;
                this.pendingResumeTimePS4 = 0;
                this.state = "";
                try {
                    videometrics.elapsed = 0
                } catch (d) {}
                clearInterval(this.getPlaybackTimeInterval);
                window.platform.getPlaybackTimeResponsed = true;
                if (!c.url && this.events.error) {
                    this.events.error()
                }
                this.getPlaybackTimeInterval = setInterval(function() {
                    if (!window.platform.videoPlayer.isPaused && TVA_Player.state.stopped != TVA_Player.player.playState && TVA_Player.state.buffering != TVA_Player.player.playState) {
                        if (window.platform.getPlaybackTimeResponsed == true) {
                            window.platform.getPlaybackTimeResponsed = false;
                            platform.sendCommand({
                                command: "getPlaybackTime"
                            })
                        }
                    }
                }, 1000);
                switch (c.drm) {
                    case "playready":
                        var b = "";
                        if (TVA.OTT.CUSTOMDATA == true) {
                            b = "v=1,pb=" + c.userData + ",dt=" + TVA.OTT.DEVICETYPE + "|"
                        }
                        var f = {
                            command: "load",
                            contentUri: c.url,
                            customData: b
                        };
                        if (c.licenseUrl) {
                            f.licenseUri = c.licenseUrl
                        }
                        platform.sendCommand(f);
                        break;
                    default:
                        platform.sendCommand({
                            command: "load",
                            contentUri: c.url
                        });
                        break
                }
                return true
            },
            stop: function() {
                OTTAnalytics.checkPosition(0);
                if (OTTAnalytics.enabled) {
                    try {
                        if (SmartPlugin) {
                            SmartPlugin.reset()
                        }
                    } catch (a) {}
                }
                platform.sendCommand({
                    command: "stop"
                });
                clearInterval(this.getPlaybackTimeInterval);
                try {
                    videometrics.elapsed = 0
                } catch (a) {}
            },
            pause: function() {
                if (!this.isPaused) {
                    platform.sendCommand({
                        command: "pause"
                    });
                    this.isPaused = true
                }
            },
            resume: function() {
                if (this.isPaused) {
                    platform.sendCommand({
                        command: "play"
                    });
                    this.isPaused = false
                }
            },
            ff: function() {
                if (!this.latestPlaybackTimeData) {
                    return
                }
                this.isSkipping = "ff";
                clearTimeout(this.skippingTimeout);
                this.latestPlaybackTimeData.currentTime += 10;
                if (this.latestPlaybackTimeData.currentTime >= this.latestPlaybackTimeData.totalTime - 5) {
                    this.latestPlaybackTimeData.currentTime = this.latestPlaybackTimeData.totalTime - 5
                }
                if (this.events.timeupdate) {
                    this.events.timeupdate(this.latestPlaybackTimeData)
                }
                var a = this;
                this.skippingTimeout = setTimeout(function() {
                    platform.sendCommand({
                        command: "setPlayTime",
                        playTime: a.latestPlaybackTimeData.currentTime
                    });
                    a.isSkipping = false
                }, 2000)
            },
            rw: function() {
                if (!this.latestPlaybackTimeData) {
                    return
                }
                this.isSkipping = "rw";
                clearTimeout(this.skippingTimeout);
                this.latestPlaybackTimeData.currentTime -= 10;
                if (this.latestPlaybackTimeData.currentTime < 0) {
                    this.latestPlaybackTimeData.currentTime = 0
                }
                if (this.events.timeupdate) {
                    this.events.timeupdate(this.latestPlaybackTimeData)
                }
                var a = this;
                this.skippingTimeout = setTimeout(function() {
                    platform.sendCommand({
                        command: "setPlayTime",
                        playTime: a.latestPlaybackTimeData.currentTime
                    });
                    a.isSkipping = false
                }, 2000)
            },
            setCurrentTime: function(a) {
                platform.sendCommand({
                    command: "setPlayTime",
                    playTime: a || 0
                })
            },
            getCurrentTime: function() {
                if (this.latestPlaybackTimeData) {
                    return this.latestPlaybackTimeData.currentTime || 0
                }
                return 0
            },
            events: {},
            setEvent: function(a, b) {
                this.events[a] = b
            },
            setOnEnded: function(a) {
                this.setEvent("ended", a)
            },
            setOnError: function(a) {
                this.setEvent("error", a)
            },
            setOnPause: function(a) {
                this.setEvent("pause", a)
            },
            setOnPlay: function(a) {
                this.setEvent("play", a)
            },
            setOnTimeUpdate: function(a) {
                this.setEvent("timeupdate", function(b) {
                    a(b)
                })
            },
            setOnWaiting: function(a) {
                this.setEvent("waiting", a)
            }
        },
        setOnCheckNetworkConnection: function(a) {
            this.onCheckNetworkConnection = function(b) {
                a(b)
            }
        }
    }
}());

(function() {
    TVA.device = "ps3";
    TVA.deviceInfo = {
        serialNumber: "",
        net_isConnected: true
    };
    var a = TVA.quit;
    TVA.quit = function() {
        if (window.platform.ver == 0) {
            a()
        }
    };
    TVA_Player.buildPlayer = function() {
        TVA_Player.player.onPlayStateChange = TVA_Player.onPlayStateChange;
        TVA_Player.player.onBuffering = TVA_Player.onBuffering
    };
    TVA_Player.deinit = function() {};
    TVA_Player.player = {
        videoData: null,
        width: "1280",
        height: "720",
        bufferingProgress: null,
        playState: TVA_Player.state.stopped,
        error: null,
        playTime: null,
        playPosition: null,
        accedo: {},
        style: {},
        setAttribute: function() {},
        play: function(f) {
            if (typeof(this.accedo.hasBeenStopped) == "undefined") {
                this.accedo.hasBeenStopped = true
            }
            if (this.videoData && this.accedo.hasBeenStopped) {
                window.platform.videoPlayer.play(this.videoData);
                this.accedo.hasBeenStopped = false;
                return
            }
            switch (f) {
                case 0:
                    window.platform.videoPlayer.pause();
                    break;
                default:
                    window.platform.videoPlayer.resume();
                    break
            }
        },
        stop: function() {
            this.videoData = null;
            window.platform.videoPlayer.stop();
            this.accedo.hasBeenStopped = true;
            TVA_Player.player.playState = TVA_Player.state.stopped;
            e(TVA_Player.player.playState)
        },
        seek: function(f) {
            window.platform.videoPlayer.setCurrentTime(f / 1000)
        }
    };
    TVA_Player.player.Stop = TVA_Player.player.stop;
    TVA.setConnectionStatus = function(f) {
        TVA.deviceInfo.net_isConnected = f
    };
    var e = function(f) {
        if (TVA_Player.player.onPlayStateChange && typeof(TVA_Player.player.onPlayStateChange) == "function") {
            TVA_Player.player.onPlayStateChange(f)
        }
    };
    window.platform.videoPlayer.setOnTimeUpdate(function(f) {
        if (f) {
            TVA_Player.player.playTime = f.totalTime * 1000 || 0;
            TVA_Player.player.playPosition = f.currentTime * 1000 || 0
        }
    });
    window.platform.videoPlayer.setOnPlay(function() {
        TVA_Player.player.playState = TVA_Player.state.playing;
        VideoPlayer.bufferingComplete();
        View.loaderHide();
        e(TVA_Player.player.playState)
    });
    window.platform.videoPlayer.setOnPause(function() {
        TVA_Player.player.playState = TVA_Player.state.paused;
        e(TVA_Player.player.playState)
    });
    window.platform.videoPlayer.setOnWaiting(function() {
        TVA_Player.player.playState = TVA_Player.state.buffering;
        e(TVA_Player.player.playState)
    });
    window.platform.videoPlayer.setOnEnded(function() {
        TVA_Player.player.playState = TVA_Player.state.finished;
        e(TVA_Player.player.playState)
    });
    window.platform.videoPlayer.setOnError(function() {
        TVA_Player.player.playState = TVA_Player.state.error;
        e(TVA_Player.player.playState)
    });
    TVA.isPSDevice = function() {
        return (navigator.userAgent.toLowerCase().indexOf("playstation") >= 0 || navigator.userAgent.toLowerCase().indexOf("sony") >= 0)
    };
    var b = function() {
        if (TVA.isPSDevice() && Main.debugMustBeEnabled() == false) {
            window.Debug = {
                log: function(f) {
                    if (TVA.OTT.DLU != "") {
                        var g = new XMLHttpRequest();
                        g.open("GET", TVA.OTT.DLU + encodeURIComponent(f), true);
                        g.send();
                        return
                    }
                    if (Debug.enabled) {
                        if (window.platform.ver >= 4 && console && console.log) {
                            try {
                                console.log("APP OUTPUT: " + f)
                            } catch (h) {}
                        } else {
                            platform.log("APP OUTPUT: " + f)
                        }
                    }
                },
                enabled: false,
                element: false,
                elementVisible: null,
                init: function(f) {
                    Debug.enabled = f
                },
                enable: function(f) {
                    Debug.enabled = f
                },
                toggle: function() {}
            }
        }
    };
    var d = function() {
        if (navigator.userAgent.toLowerCase().match(/playstation/) && window.platform && window.platform.id == "PS" && window.platform.keyCodes) {
            TVA.tvKey.KEY_LEFT = window.platform.keyCodes.KEY_LEFT;
            TVA.tvKey.KEY_UP = window.platform.keyCodes.KEY_UP;
            TVA.tvKey.KEY_RIGHT = window.platform.keyCodes.KEY_RIGHT;
            TVA.tvKey.KEY_DOWN = window.platform.keyCodes.KEY_DOWN;
            TVA.tvKey.KEY_RETURN = window.platform.keyCodes.KEY_CIRCLE;
            TVA.tvKey.KEY_ENTER = window.platform.keyCodes.KEY_CROSS;
            TVA.tvKey.KEY_0 = window.platform.keyCodes.KEY_SQUARE;
            TVA.tvKey.KEY_1 = window.platform.keyCodes.KEY_TRIANGLE;
            TVA.tvKey.KEY_2 = window.platform.keyCodes.KEY_L3;
            TVA.tvKey.KEY_RED = window.platform.keyCodes.KEY_L1;
            TVA.tvKey.KEY_GREEN = window.platform.keyCodes.KEY_L2;
            TVA.tvKey.KEY_YELLOW = window.platform.keyCodes.KEY_R2;
            TVA.tvKey.KEY_BLUE = window.platform.keyCodes.KEY_R1;
            TVA.tvKey.KEY_PLAY = window.platform.keyCodes.KEY_START;
            TVA.tvKey.FN_12 = window.platform.keyCodes.KEY_SELECT
        } else {
            if (navigator.userAgent.toLowerCase().match(/sony/) && window.platform && window.platform.id == "PS" && window.platform.keyCodes) {
                TVA.tvKey.KEY_LEFT = window.VK_LEFT;
                TVA.tvKey.KEY_UP = window.VK_UP;
                TVA.tvKey.KEY_DOWN = window.VK_DOWN;
                TVA.tvKey.KEY_RIGHT = window.VK_RIGHT;
                TVA.tvKey.KEY_ENTER = window.VK_ENTER;
                TVA.tvKey.KEY_RETURN = window.VK_BACK_SPACE;
                TVA.tvKey.KEY_RED = window.VK_RED;
                TVA.tvKey.KEY_GREEN = window.VK_GREEN;
                TVA.tvKey.KEY_YELLOW = window.VK_YELLOW;
                TVA.tvKey.KEY_BLUE = window.VK_BLUE;
                TVA.tvKey.KEY_0 = window.VK_0;
                TVA.tvKey.KEY_1 = window.VK_1;
                TVA.tvKey.KEY_2 = window.VK_2;
                TVA.tvKey.KEY_3 = window.VK_3;
                TVA.tvKey.KEY_4 = window.VK_4;
                TVA.tvKey.KEY_5 = window.VK_5;
                TVA.tvKey.KEY_6 = window.VK_6;
                TVA.tvKey.KEY_7 = window.VK_7;
                TVA.tvKey.KEY_8 = window.VK_8;
                TVA.tvKey.KEY_9 = window.VK_9;
                TVA.tvKey.KEY_PLAY = window.VK_PLAY;
                TVA.tvKey.KEY_PAUSE = window.VK_PAUSE;
                TVA.tvKey.KEY_STOP = window.VK_STOP;
                TVA.tvKey.KEY_NEXT = window.VK_TRACK_NEXT;
                TVA.tvKey.KEY_PREV = window.VK_TRACK_PREV;
                TVA.tvKey.KEY_FAST_FW = window.VK_TRACK_NEXT;
                TVA.tvKey.KEY_FAST_RW = window.VK_TRACK_PREV;
                TVA.tvKey.KEY_FF = window.VK_FAST_FWD;
                TVA.tvKey.KEY_RW = window.VK_REWIND;
                TVA.tvKey.KEY_SUBTITLE = window.VK_SUBTITLE;
                TVA.tvKey.KEY_INFO = window.VK_INFO;
                TVA.tvKey.KEY_EXIT = window.VK_EXIT;
                window.platform.keyCodes.KEY_L1 = TVA.tvKey.KEY_RED;
                window.platform.keyCodes.KEY_L2 = TVA.tvKey.KEY_GREEN;
                window.platform.keyCodes.KEY_R2 = TVA.tvKey.KEY_YELLOW;
                window.platform.keyCodes.KEY_R1 = TVA.tvKey.KEY_BLUE;
                TVA.tvKey.KEY_CHLIST = 460
            }
        }
    };
    TVA.checkKeys = function(f) {
        if (window.platform.ver == 0) {
            return f
        }
        if (f == window.platform.keyCodes.KEY_R1 && View.actualPageIs(VideoPlayer)) {
            return TVA.tvKey.KEY_BLUE
        }
        switch (f) {
            case window.platform.keyCodes.KEY_TOUCHPAD:
                return TVA.tvKey.KEY_PLAY;
            case window.platform.keyCodes.KEY_ENTER:
                return TVA.tvKey.KEY_ENTER;
            case window.platform.keyCodes.KEY_RETURN:
                return TVA.tvKey.KEY_RETURN;
            case window.platform.keyCodes.KEY_PLAY:
                return TVA.tvKey.KEY_PLAY;
            case window.platform.keyCodes.KEY_STOP:
                return TVA.tvKey.KEY_STOP;
            case window.platform.keyCodes.KEY_PAUSE:
                return TVA.tvKey.KEY_PAUSE;
            case window.platform.keyCodes.KEY_FAST_RW:
                return TVA.tvKey.KEY_FAST_RW;
            case window.platform.keyCodes.KEY_FAST_FW:
                return TVA.tvKey.KEY_FAST_FW;
            case window.platform.keyCodes.KEY_RW:
                return TVA.tvKey.KEY_RW;
            case window.platform.keyCodes.KEY_PREV:
                return TVA.tvKey.KEY_RW;
            case window.platform.keyCodes.KEY_FF:
                return TVA.tvKey.KEY_FF;
            case window.platform.keyCodes.KEY_NEXT:
                return TVA.tvKey.KEY_FF;
            case window.platform.keyCodes.KEY_RED:
                return TVA.tvKey.KEY_RED;
            case window.platform.keyCodes.KEY_GREEN:
                return TVA.tvKey.KEY_GREEN;
            case window.platform.keyCodes.KEY_YELLOW:
                return TVA.tvKey.KEY_YELLOW;
            case window.platform.keyCodes.KEY_BLUE:
                return TVA.tvKey.KEY_PLAY;
            case TVA.tvKey.KEY_BLUE:
                return TVA.tvKey.KEY_PLAY;
            case window.platform.keyCodes.KEY_0:
                return TVA.tvKey.KEY_0;
            case window.platform.keyCodes.KEY_1:
                return TVA.tvKey.KEY_1;
            case window.platform.keyCodes.KEY_2:
                return TVA.tvKey.KEY_2;
            case window.platform.keyCodes.KEY_3:
                return TVA.tvKey.KEY_3;
            case window.platform.keyCodes.KEY_4:
                return TVA.tvKey.KEY_4;
            case window.platform.keyCodes.KEY_5:
                return TVA.tvKey.KEY_5;
            case window.platform.keyCodes.KEY_6:
                return TVA.tvKey.KEY_6;
            case window.platform.keyCodes.KEY_7:
                return TVA.tvKey.KEY_7;
            case window.platform.keyCodes.KEY_8:
                return TVA.tvKey.KEY_8;
            case window.platform.keyCodes.KEY_9:
                return TVA.tvKey.KEY_9;
            case window.platform.keyCodes.KEY_TIME:
                return TVA.tvKey.FN_12;
            case window.platform.keyCodes.KEY_TOP_M:
                return TVA.tvKey.KEY_0;
            case window.platform.keyCodes.KEY_POPUP_M:
                return TVA.tvKey.KEY_0;
            default:
                break
        }
        return f
    };
    var c = window.onload || null;
    window.onload = function() {
        b();
        d();
        if (window.platform && window.platform.init && (navigator.userAgent.toLowerCase().match(/playstation/) || navigator.userAgent.toLowerCase().match(/sony/))) {
            window.platform.init(function() {
                if (c) {
                    c()
                }
            })
        } else {
            if (TVA.isPSDevice() == false) {
                window.platform.keyCodes.KEY_PLAY = 107;
                window.platform.keyCodes.KEY_PAUSE = 109;
                window.platform.keyCodes.KEY_STOP = 111
            }
            if (c) {
                c()
            }
        }
        window.platform.setOnCheckNetworkConnection(TVA.setConnectionStatus)
    }
}());
/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function(a2, aG) {
    var ai, w, aC = typeof aG,
        l = a2.document,
        aL = a2.location,
        bi = a2.jQuery,
        H = a2.$,
        aa = {},
        a6 = [],
        s = "1.9.1",
        aI = a6.concat,
        ao = a6.push,
        a4 = a6.slice,
        aM = a6.indexOf,
        z = aa.toString,
        V = aa.hasOwnProperty,
        aQ = s.trim,
        bJ = function(e, b3) {
            return new bJ.fn.init(e, b3, w)
        },
        bA = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
        ac = /\S+/g,
        C = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        br = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,
        a = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        bh = /^[\],:{}\s]*$/,
        bk = /(?:^|:|,)(?:\s*\[)+/g,
        bG = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
        aZ = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,
        bS = /^-ms-/,
        aV = /-([\da-z])/gi,
        M = function(e, b3) {
            return b3.toUpperCase()
        },
        bW = function(e) {
            if (l.addEventListener || e.type === "load" || l.readyState === "complete") {
                bl();
                bJ.ready()
            }
        },
        bl = function() {
            if (l.addEventListener) {
                l.removeEventListener("DOMContentLoaded", bW, false);
                a2.removeEventListener("load", bW, false)
            } else {
                l.detachEvent("onreadystatechange", bW);
                a2.detachEvent("onload", bW)
            }
        };
    bJ.fn = bJ.prototype = {
        jquery: s,
        constructor: bJ,
        init: function(e, b5, b4) {
            var b3, b6;
            if (!e) {
                return this
            }
            if (typeof e === "string") {
                if (e.charAt(0) === "<" && e.charAt(e.length - 1) === ">" && e.length >= 3) {
                    b3 = [null, e, null]
                } else {
                    b3 = br.exec(e)
                }
                if (b3 && (b3[1] || !b5)) {
                    if (b3[1]) {
                        b5 = b5 instanceof bJ ? b5[0] : b5;
                        bJ.merge(this, bJ.parseHTML(b3[1], b5 && b5.nodeType ? b5.ownerDocument || b5 : l, true));
                        if (a.test(b3[1]) && bJ.isPlainObject(b5)) {
                            for (b3 in b5) {
                                if (bJ.isFunction(this[b3])) {
                                    this[b3](b5[b3])
                                } else {
                                    this.attr(b3, b5[b3])
                                }
                            }
                        }
                        return this
                    } else {
                        b6 = l.getElementById(b3[2]);
                        if (b6 && b6.parentNode) {
                            if (b6.id !== b3[2]) {
                                return b4.find(e)
                            }
                            this.length = 1;
                            this[0] = b6
                        }
                        this.context = l;
                        this.selector = e;
                        return this
                    }
                } else {
                    if (!b5 || b5.jquery) {
                        return (b5 || b4).find(e)
                    } else {
                        return this.constructor(b5).find(e)
                    }
                }
            } else {
                if (e.nodeType) {
                    this.context = this[0] = e;
                    this.length = 1;
                    return this
                } else {
                    if (bJ.isFunction(e)) {
                        return b4.ready(e)
                    }
                }
            }
            if (e.selector !== aG) {
                this.selector = e.selector;
                this.context = e.context
            }
            return bJ.makeArray(e, this)
        },
        selector: "",
        length: 0,
        size: function() {
            return this.length
        },
        toArray: function() {
            return a4.call(this)
        },
        get: function(e) {
            return e == null ? this.toArray() : (e < 0 ? this[this.length + e] : this[e])
        },
        pushStack: function(e) {
            var b3 = bJ.merge(this.constructor(), e);
            b3.prevObject = this;
            b3.context = this.context;
            return b3
        },
        each: function(b3, e) {
            return bJ.each(this, b3, e)
        },
        ready: function(e) {
            bJ.ready.promise().done(e);
            return this
        },
        slice: function() {
            return this.pushStack(a4.apply(this, arguments))
        },
        first: function() {
            return this.eq(0)
        },
        last: function() {
            return this.eq(-1)
        },
        eq: function(b4) {
            var e = this.length,
                b3 = +b4 + (b4 < 0 ? e : 0);
            return this.pushStack(b3 >= 0 && b3 < e ? [this[b3]] : [])
        },
        map: function(e) {
            return this.pushStack(bJ.map(this, function(b4, b3) {
                return e.call(b4, b3, b4)
            }))
        },
        end: function() {
            return this.prevObject || this.constructor(null)
        },
        push: ao,
        sort: [].sort,
        splice: [].splice
    };
    bJ.fn.init.prototype = bJ.fn;
    bJ.extend = bJ.fn.extend = function() {
        var e, b8, b3, b4, cb, b9, b7 = arguments[0] || {},
            b6 = 1,
            b5 = arguments.length,
            ca = false;
        if (typeof b7 === "boolean") {
            ca = b7;
            b7 = arguments[1] || {};
            b6 = 2
        }
        if (typeof b7 !== "object" && !bJ.isFunction(b7)) {
            b7 = {}
        }
        if (b5 === b6) {
            b7 = this;
            --b6
        }
        for (; b6 < b5; b6++) {
            if ((cb = arguments[b6]) != null) {
                for (b4 in cb) {
                    e = b7[b4];
                    b3 = cb[b4];
                    if (b7 === b3) {
                        continue
                    }
                    if (ca && b3 && (bJ.isPlainObject(b3) || (b8 = bJ.isArray(b3)))) {
                        if (b8) {
                            b8 = false;
                            b9 = e && bJ.isArray(e) ? e : []
                        } else {
                            b9 = e && bJ.isPlainObject(e) ? e : {}
                        }
                        b7[b4] = bJ.extend(ca, b9, b3)
                    } else {
                        if (b3 !== aG) {
                            b7[b4] = b3
                        }
                    }
                }
            }
        }
        return b7
    };
    bJ.extend({
        noConflict: function(e) {
            if (a2.$ === bJ) {
                a2.$ = H
            }
            if (e && a2.jQuery === bJ) {
                a2.jQuery = bi
            }
            return bJ
        },
        isReady: false,
        readyWait: 1,
        holdReady: function(e) {
            if (e) {
                bJ.readyWait++
            } else {
                bJ.ready(true)
            }
        },
        ready: function(e) {
            if (e === true ? --bJ.readyWait : bJ.isReady) {
                return
            }
            if (!l.body) {
                return setTimeout(bJ.ready)
            }
            bJ.isReady = true;
            if (e !== true && --bJ.readyWait > 0) {
                return
            }
            ai.resolveWith(l, [bJ]);
            if (bJ.fn.trigger) {
                bJ(l).trigger("ready").off("ready")
            }
        },
        isFunction: function(e) {
            return bJ.type(e) === "function"
        },
        isArray: Array.isArray || function(e) {
            return bJ.type(e) === "array"
        },
        isWindow: function(e) {
            return e != null && e == e.window
        },
        isNumeric: function(e) {
            return !isNaN(parseFloat(e)) && isFinite(e)
        },
        type: function(e) {
            if (e == null) {
                return String(e)
            }
            return typeof e === "object" || typeof e === "function" ? aa[z.call(e)] || "object" : typeof e
        },
        isPlainObject: function(b5) {
            if (!b5 || bJ.type(b5) !== "object" || b5.nodeType || bJ.isWindow(b5)) {
                return false
            }
            try {
                if (b5.constructor && !V.call(b5, "constructor") && !V.call(b5.constructor.prototype, "isPrototypeOf")) {
                    return false
                }
            } catch (b4) {
                return false
            }
            var b3;
            for (b3 in b5) {}
            return b3 === aG || V.call(b5, b3)
        },
        isEmptyObject: function(b3) {
            var e;
            for (e in b3) {
                return false
            }
            return true
        },
        error: function(e) {
            throw new Error(e)
        },
        parseHTML: function(b6, b4, b5) {
            if (!b6 || typeof b6 !== "string") {
                return null
            }
            if (typeof b4 === "boolean") {
                b5 = b4;
                b4 = false
            }
            b4 = b4 || l;
            var b3 = a.exec(b6),
                e = !b5 && [];
            if (b3) {
                return [b4.createElement(b3[1])]
            }
            b3 = bJ.buildFragment([b6], b4, e);
            if (e) {
                bJ(e).remove()
            }
            return bJ.merge([], b3.childNodes)
        },
        parseJSON: function(b3) {
            if (b3 === null) {
                return b3
            }
            if (a2.JSON && a2.JSON.parse) {
                try {
                    return a2.JSON.parse(b3)
                } catch (b4) {
                    return null
                }
            }
            if (typeof b3 === "string") {
                b3 = bJ.trim(b3);
                if (b3) {
                    if (bh.test(b3.replace(bG, "@").replace(aZ, "]").replace(bk, ""))) {
                        return (new Function("return " + b3))()
                    }
                }
            }
            bJ.error("Invalid JSON: " + b3)
        },
        parseXML: function(b5) {
            var b3, b4;
            if (!b5 || typeof b5 !== "string") {
                return null
            }
            try {
                if (a2.DOMParser) {
                    b4 = new DOMParser();
                    b3 = b4.parseFromString(b5, "text/xml")
                } else {
                    b3 = new ActiveXObject("Microsoft.XMLDOM");
                    b3.async = "false";
                    b3.loadXML(b5)
                }
            } catch (b6) {
                b3 = aG
            }
            if (!b3 || !b3.documentElement || b3.getElementsByTagName("parsererror").length) {
                bJ.error("Invalid XML: " + b5)
            }
            return b3
        },
        noop: function() {},
        globalEval: function(e) {
            if (e && bJ.trim(e)) {
                (a2.execScript || function(b3) {
                    a2["eval"].call(a2, b3)
                })(e)
            }
        },
        camelCase: function(e) {
            return e.replace(bS, "ms-").replace(aV, M)
        },
        nodeName: function(b3, e) {
            return b3.nodeName && b3.nodeName.toLowerCase() === e.toLowerCase()
        },
        each: function(b7, b8, b3) {
            var b6, b4 = 0,
                b5 = b7.length,
                e = ab(b7);
            if (b3) {
                if (e) {
                    for (; b4 < b5; b4++) {
                        b6 = b8.apply(b7[b4], b3);
                        if (b6 === false) {
                            break
                        }
                    }
                } else {
                    for (b4 in b7) {
                        b6 = b8.apply(b7[b4], b3);
                        if (b6 === false) {
                            break
                        }
                    }
                }
            } else {
                if (e) {
                    for (; b4 < b5; b4++) {
                        b6 = b8.call(b7[b4], b4, b7[b4]);
                        if (b6 === false) {
                            break
                        }
                    }
                } else {
                    for (b4 in b7) {
                        b6 = b8.call(b7[b4], b4, b7[b4]);
                        if (b6 === false) {
                            break
                        }
                    }
                }
            }
            return b7
        },
        trim: aQ && !aQ.call("\uFEFF\xA0") ? function(e) {
            return e == null ? "" : aQ.call(e)
        } : function(e) {
            return e == null ? "" : (e + "").replace(C, "")
        },
        makeArray: function(e, b4) {
            var b3 = b4 || [];
            if (e != null) {
                if (ab(Object(e))) {
                    bJ.merge(b3, typeof e === "string" ? [e] : e)
                } else {
                    ao.call(b3, e)
                }
            }
            return b3
        },
        inArray: function(b5, b3, b4) {
            var e;
            if (b3) {
                if (aM) {
                    return aM.call(b3, b5, b4)
                }
                e = b3.length;
                b4 = b4 ? b4 < 0 ? Math.max(0, e + b4) : b4 : 0;
                for (; b4 < e; b4++) {
                    if (b4 in b3 && b3[b4] === b5) {
                        return b4
                    }
                }
            }
            return -1
        },
        merge: function(b6, b4) {
            var e = b4.length,
                b5 = b6.length,
                b3 = 0;
            if (typeof e === "number") {
                for (; b3 < e; b3++) {
                    b6[b5++] = b4[b3]
                }
            } else {
                while (b4[b3] !== aG) {
                    b6[b5++] = b4[b3++]
                }
            }
            b6.length = b5;
            return b6
        },
        grep: function(b3, b8, e) {
            var b7, b4 = [],
                b5 = 0,
                b6 = b3.length;
            e = !!e;
            for (; b5 < b6; b5++) {
                b7 = !!b8(b3[b5], b5);
                if (e !== b7) {
                    b4.push(b3[b5])
                }
            }
            return b4
        },
        map: function(b4, b9, e) {
            var b8, b6 = 0,
                b7 = b4.length,
                b3 = ab(b4),
                b5 = [];
            if (b3) {
                for (; b6 < b7; b6++) {
                    b8 = b9(b4[b6], b6, e);
                    if (b8 != null) {
                        b5[b5.length] = b8
                    }
                }
            } else {
                for (b6 in b4) {
                    b8 = b9(b4[b6], b6, e);
                    if (b8 != null) {
                        b5[b5.length] = b8
                    }
                }
            }
            return aI.apply([], b5)
        },
        guid: 1,
        proxy: function(b6, b5) {
            var e, b4, b3;
            if (typeof b5 === "string") {
                b3 = b6[b5];
                b5 = b6;
                b6 = b3
            }
            if (!bJ.isFunction(b6)) {
                return aG
            }
            e = a4.call(arguments, 2);
            b4 = function() {
                return b6.apply(b5 || this, e.concat(a4.call(arguments)))
            };
            b4.guid = b6.guid = b6.guid || bJ.guid++;
            return b4
        },
        access: function(e, b7, b9, b8, b5, cb, ca) {
            var b4 = 0,
                b3 = e.length,
                b6 = b9 == null;
            if (bJ.type(b9) === "object") {
                b5 = true;
                for (b4 in b9) {
                    bJ.access(e, b7, b4, b9[b4], true, cb, ca)
                }
            } else {
                if (b8 !== aG) {
                    b5 = true;
                    if (!bJ.isFunction(b8)) {
                        ca = true
                    }
                    if (b6) {
                        if (ca) {
                            b7.call(e, b8);
                            b7 = null
                        } else {
                            b6 = b7;
                            b7 = function(cd, cc, ce) {
                                return b6.call(bJ(cd), ce)
                            }
                        }
                    }
                    if (b7) {
                        for (; b4 < b3; b4++) {
                            b7(e[b4], b9, ca ? b8 : b8.call(e[b4], b4, b7(e[b4], b9)))
                        }
                    }
                }
            }
            return b5 ? e : b6 ? b7.call(e) : b3 ? b7(e[0], b9) : cb
        },
        now: function() {
            return (new Date()).getTime()
        }
    });
    bJ.ready.promise = function(b6) {
        if (!ai) {
            ai = bJ.Deferred();
            if (l.readyState === "complete") {
                setTimeout(bJ.ready)
            } else {
                if (l.addEventListener) {
                    l.addEventListener("DOMContentLoaded", bW, false);
                    a2.addEventListener("load", bW, false)
                } else {
                    l.attachEvent("onreadystatechange", bW);
                    a2.attachEvent("onload", bW);
                    var b5 = false;
                    try {
                        b5 = a2.frameElement == null && l.documentElement
                    } catch (b4) {}
                    if (b5 && b5.doScroll) {
                        (function b3() {
                            if (!bJ.isReady) {
                                try {
                                    b5.doScroll("left")
                                } catch (b7) {
                                    return setTimeout(b3, 50)
                                }
                                bl();
                                bJ.ready()
                            }
                        })()
                    }
                }
            }
        }
        return ai.promise(b6)
    };
    bJ.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(b3, e) {
        aa["[object " + e + "]"] = e.toLowerCase()
    });

    function ab(b4) {
        var b3 = b4.length,
            e = bJ.type(b4);
        if (bJ.isWindow(b4)) {
            return false
        }
        if (b4.nodeType === 1 && b3) {
            return true
        }
        return e === "array" || e !== "function" && (b3 === 0 || typeof b3 === "number" && b3 > 0 && (b3 - 1) in b4)
    }
    w = bJ(l);
    var bY = {};

    function ae(b3) {
        var e = bY[b3] = {};
        bJ.each(b3.match(ac) || [], function(b5, b4) {
            e[b4] = true
        });
        return e
    }
    bJ.Callbacks = function(cc) {
        cc = typeof cc === "string" ? (bY[cc] || ae(cc)) : bJ.extend({}, cc);
        var b6, b5, e, b7, b8, b4, b9 = [],
            ca = !cc.once && [],
            b3 = function(cd) {
                b5 = cc.memory && cd;
                e = true;
                b8 = b4 || 0;
                b4 = 0;
                b7 = b9.length;
                b6 = true;
                for (; b9 && b8 < b7; b8++) {
                    if (b9[b8].apply(cd[0], cd[1]) === false && cc.stopOnFalse) {
                        b5 = false;
                        break
                    }
                }
                b6 = false;
                if (b9) {
                    if (ca) {
                        if (ca.length) {
                            b3(ca.shift())
                        }
                    } else {
                        if (b5) {
                            b9 = []
                        } else {
                            cb.disable()
                        }
                    }
                }
            },
            cb = {
                add: function() {
                    if (b9) {
                        var ce = b9.length;
                        (function cd(cf) {
                            bJ.each(cf, function(ch, cg) {
                                var ci = bJ.type(cg);
                                if (ci === "function") {
                                    if (!cc.unique || !cb.has(cg)) {
                                        b9.push(cg)
                                    }
                                } else {
                                    if (cg && cg.length && ci !== "string") {
                                        cd(cg)
                                    }
                                }
                            })
                        })(arguments);
                        if (b6) {
                            b7 = b9.length
                        } else {
                            if (b5) {
                                b4 = ce;
                                b3(b5)
                            }
                        }
                    }
                    return this
                },
                remove: function() {
                    if (b9) {
                        bJ.each(arguments, function(cf, cd) {
                            var ce;
                            while ((ce = bJ.inArray(cd, b9, ce)) > -1) {
                                b9.splice(ce, 1);
                                if (b6) {
                                    if (ce <= b7) {
                                        b7--
                                    }
                                    if (ce <= b8) {
                                        b8--
                                    }
                                }
                            }
                        })
                    }
                    return this
                },
                has: function(cd) {
                    return cd ? bJ.inArray(cd, b9) > -1 : !!(b9 && b9.length)
                },
                empty: function() {
                    b9 = [];
                    return this
                },
                disable: function() {
                    b9 = ca = b5 = aG;
                    return this
                },
                disabled: function() {
                    return !b9
                },
                lock: function() {
                    ca = aG;
                    if (!b5) {
                        cb.disable()
                    }
                    return this
                },
                locked: function() {
                    return !ca
                },
                fireWith: function(ce, cd) {
                    cd = cd || [];
                    cd = [ce, cd.slice ? cd.slice() : cd];
                    if (b9 && (!e || ca)) {
                        if (b6) {
                            ca.push(cd)
                        } else {
                            b3(cd)
                        }
                    }
                    return this
                },
                fire: function() {
                    cb.fireWith(this, arguments);
                    return this
                },
                fired: function() {
                    return !!e
                }
            };
        return cb
    };
    bJ.extend({
        Deferred: function(b4) {
            var b3 = [
                    ["resolve", "done", bJ.Callbacks("once memory"), "resolved"],
                    ["reject", "fail", bJ.Callbacks("once memory"), "rejected"],
                    ["notify", "progress", bJ.Callbacks("memory")]
                ],
                b5 = "pending",
                b6 = {
                    state: function() {
                        return b5
                    },
                    always: function() {
                        e.done(arguments).fail(arguments);
                        return this
                    },
                    then: function() {
                        var b7 = arguments;
                        return bJ.Deferred(function(b8) {
                            bJ.each(b3, function(ca, b9) {
                                var cc = b9[0],
                                    cb = bJ.isFunction(b7[ca]) && b7[ca];
                                e[b9[1]](function() {
                                    var cd = cb && cb.apply(this, arguments);
                                    if (cd && bJ.isFunction(cd.promise)) {
                                        cd.promise().done(b8.resolve).fail(b8.reject).progress(b8.notify)
                                    } else {
                                        b8[cc + "With"](this === b6 ? b8.promise() : this, cb ? [cd] : arguments)
                                    }
                                })
                            });
                            b7 = null
                        }).promise()
                    },
                    promise: function(b7) {
                        return b7 != null ? bJ.extend(b7, b6) : b6
                    }
                },
                e = {};
            b6.pipe = b6.then;
            bJ.each(b3, function(b8, b7) {
                var ca = b7[2],
                    b9 = b7[3];
                b6[b7[1]] = ca.add;
                if (b9) {
                    ca.add(function() {
                        b5 = b9
                    }, b3[b8 ^ 1][2].disable, b3[2][2].lock)
                }
                e[b7[0]] = function() {
                    e[b7[0] + "With"](this === e ? b6 : this, arguments);
                    return this
                };
                e[b7[0] + "With"] = ca.fireWith
            });
            b6.promise(e);
            if (b4) {
                b4.call(e, e)
            }
            return e
        },
        when: function(b6) {
            var b4 = 0,
                b8 = a4.call(arguments),
                e = b8.length,
                b3 = e !== 1 || (b6 && bJ.isFunction(b6.promise)) ? e : 0,
                cb = b3 === 1 ? b6 : bJ.Deferred(),
                b5 = function(cd, ce, cc) {
                    return function(cf) {
                        ce[cd] = this;
                        cc[cd] = arguments.length > 1 ? a4.call(arguments) : cf;
                        if (cc === ca) {
                            cb.notifyWith(ce, cc)
                        } else {
                            if (!(--b3)) {
                                cb.resolveWith(ce, cc)
                            }
                        }
                    }
                },
                ca, b7, b9;
            if (e > 1) {
                ca = new Array(e);
                b7 = new Array(e);
                b9 = new Array(e);
                for (; b4 < e; b4++) {
                    if (b8[b4] && bJ.isFunction(b8[b4].promise)) {
                        b8[b4].promise().done(b5(b4, b9, b8)).fail(cb.reject).progress(b5(b4, b7, ca))
                    } else {
                        --b3
                    }
                }
            }
            if (!b3) {
                cb.resolveWith(b9, b8)
            }
            return cb.promise()
        }
    });
    bJ.support = (function() {
        var ce, cd, cb, ca, cc, b9, b5, b7, b4, b6, b3 = l.createElement("div");
        b3.setAttribute("className", "t");
        TVA.putInnerHTML(b3, "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>");
        cd = b3.getElementsByTagName("*");
        cb = b3.getElementsByTagName("a")[0];
        if (!cd || !cb || !cd.length) {
            return {}
        }
        cc = l.createElement("select");
        b5 = cc.appendChild(l.createElement("option"));
        ca = b3.getElementsByTagName("input")[0];
        cb.style.cssText = "top:1px;float:left;opacity:.5";
        ce = {
            getSetAttribute: b3.className !== "t",
            leadingWhitespace: b3.firstChild.nodeType === 3,
            tbody: !b3.getElementsByTagName("tbody").length,
            htmlSerialize: !!b3.getElementsByTagName("link").length,
            style: /top/.test(cb.getAttribute("style")),
            hrefNormalized: cb.getAttribute("href") === "/a",
            opacity: /^0.5/.test(cb.style.opacity),
            cssFloat: !!cb.style.cssFloat,
            checkOn: !!ca.value,
            optSelected: b5.selected,
            enctype: !!l.createElement("form").enctype,
            html5Clone: l.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>",
            boxModel: l.compatMode === "CSS1Compat",
            deleteExpando: true,
            noCloneEvent: true,
            inlineBlockNeedsLayout: false,
            shrinkWrapBlocks: false,
            reliableMarginRight: true,
            boxSizingReliable: true,
            pixelPosition: false
        };
        ca.checked = true;
        ce.noCloneChecked = ca.cloneNode(true).checked;
        cc.disabled = true;
        ce.optDisabled = !b5.disabled;
        try {
            delete b3.test
        } catch (b8) {
            ce.deleteExpando = false
        }
        ca = l.createElement("input");
        ca.setAttribute("value", "");
        ce.input = ca.getAttribute("value") === "";
        ca.value = "t";
        ca.setAttribute("type", "radio");
        ce.radioValue = ca.value === "t";
        ca.setAttribute("checked", "t");
        ca.setAttribute("name", "t");
        b9 = l.createDocumentFragment();
        b9.appendChild(ca);
        ce.appendChecked = ca.checked;
        ce.checkClone = b9.cloneNode(true).cloneNode(true).lastChild.checked;
        if (b3.attachEvent) {
            b3.attachEvent("onclick", function() {
                ce.noCloneEvent = false
            });
            b3.cloneNode(true).click()
        }
        for (b6 in {
                submit: true,
                change: true,
                focusin: true
            }) {
            b3.setAttribute(b7 = "on" + b6, "t");
            ce[b6 + "Bubbles"] = b7 in a2 || b3.attributes[b7].expando === false
        }
        b3.style.backgroundClip = "content-box";
        b3.cloneNode(true).style.backgroundClip = "";
        ce.clearCloneStyle = b3.style.backgroundClip === "content-box";
        bJ(function() {
            var cf, cj, ci, cg = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
                e = l.getElementsByTagName("body")[0];
            if (!e) {
                return
            }
            cf = l.createElement("div");
            cf.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";
            e.appendChild(cf).appendChild(b3);
            TVA.putInnerHTML(b3, "<table><tr><td></td><td>t</td></tr></table>");
            ci = b3.getElementsByTagName("td");
            ci[0].style.cssText = "padding:0;margin:0;border:0;display:none";
            b4 = (ci[0].offsetHeight === 0);
            ci[0].style.display = "";
            ci[1].style.display = "none";
            ce.reliableHiddenOffsets = b4 && (ci[0].offsetHeight === 0);
            TVA.putInnerHTML(b3, "");
            b3.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
            ce.boxSizing = (b3.offsetWidth === 4);
            ce.doesNotIncludeMarginInBodyOffset = (e.offsetTop !== 1);
            if (a2.getComputedStyle) {
                ce.pixelPosition = (a2.getComputedStyle(b3, null) || {}).top !== "1%";
                ce.boxSizingReliable = (a2.getComputedStyle(b3, null) || {
                    width: "4px"
                }).width === "4px";
                cj = b3.appendChild(l.createElement("div"));
                cj.style.cssText = b3.style.cssText = cg;
                cj.style.marginRight = cj.style.width = "0";
                b3.style.width = "1px";
                ce.reliableMarginRight = !parseFloat((a2.getComputedStyle(cj, null) || {}).marginRight)
            }
            if (typeof b3.style.zoom !== aC) {
                TVA.putInnerHTML(b3, "");
                b3.style.cssText = cg + "width:1px;padding:1px;display:inline;zoom:1";
                ce.inlineBlockNeedsLayout = (b3.offsetWidth === 3);
                b3.style.display = "block";
                TVA.putInnerHTML(b3, "<div></div>");
                b3.firstChild.style.width = "5px";
                ce.shrinkWrapBlocks = (b3.offsetWidth !== 3);
                if (ce.inlineBlockNeedsLayout) {
                    e.style.zoom = 1
                }
            }
            var ch = e.removeChild(cf);
            cf = b3 = ci = cj = null
        });
        cd = cc = b9 = b5 = cb = ca = null;
        return ce
    })();
    var bw = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
        aN = /([A-Z])/g;

    function ba(b5, b3, b7, b6) {
        if (!bJ.acceptData(b5)) {
            return
        }
        var b8, ca, cb = bJ.expando,
            b9 = typeof b3 === "string",
            cc = b5.nodeType,
            e = cc ? bJ.cache : b5,
            b4 = cc ? b5[cb] : b5[cb] && cb;
        if ((!b4 || !e[b4] || (!b6 && !e[b4].data)) && b9 && b7 === aG) {
            return
        }
        if (!b4) {
            if (cc) {
                b5[cb] = b4 = a6.pop() || bJ.guid++
            } else {
                b4 = cb
            }
        }
        if (!e[b4]) {
            e[b4] = {};
            if (!cc) {
                e[b4].toJSON = bJ.noop
            }
        }
        if (typeof b3 === "object" || typeof b3 === "function") {
            if (b6) {
                e[b4] = bJ.extend(e[b4], b3)
            } else {
                e[b4].data = bJ.extend(e[b4].data, b3)
            }
        }
        b8 = e[b4];
        if (!b6) {
            if (!b8.data) {
                b8.data = {}
            }
            b8 = b8.data
        }
        if (b7 !== aG) {
            b8[bJ.camelCase(b3)] = b7
        }
        if (b9) {
            ca = b8[b3];
            if (ca == null) {
                ca = b8[bJ.camelCase(b3)]
            }
        } else {
            ca = b8
        }
        return ca
    }

    function Z(b5, b3, b6) {
        if (!bJ.acceptData(b5)) {
            return
        }
        var b8, b7, b9, ca = b5.nodeType,
            e = ca ? bJ.cache : b5,
            b4 = ca ? b5[bJ.expando] : bJ.expando;
        if (!e[b4]) {
            return
        }
        if (b3) {
            b9 = b6 ? e[b4] : e[b4].data;
            if (b9) {
                if (!bJ.isArray(b3)) {
                    if (b3 in b9) {
                        b3 = [b3]
                    } else {
                        b3 = bJ.camelCase(b3);
                        if (b3 in b9) {
                            b3 = [b3]
                        } else {
                            b3 = b3.split(" ")
                        }
                    }
                } else {
                    b3 = b3.concat(bJ.map(b3, bJ.camelCase))
                }
                for (b8 = 0, b7 = b3.length; b8 < b7; b8++) {
                    delete b9[b3[b8]]
                }
                if (!(b6 ? N : bJ.isEmptyObject)(b9)) {
                    return
                }
            }
        }
        if (!b6) {
            delete e[b4].data;
            if (!N(e[b4])) {
                return
            }
        }
        if (ca) {
            bJ.cleanData([b5], true)
        } else {
            if (bJ.support.deleteExpando || e != e.window) {
                delete e[b4]
            } else {
                e[b4] = null
            }
        }
    }
    bJ.extend({
        cache: {},
        expando: "jQuery" + (s + Math.random()).replace(/\D/g, ""),
        noData: {
            embed: true,
            object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            applet: true
        },
        hasData: function(e) {
            e = e.nodeType ? bJ.cache[e[bJ.expando]] : e[bJ.expando];
            return !!e && !N(e)
        },
        data: function(b3, e, b4) {
            return ba(b3, e, b4)
        },
        removeData: function(b3, e) {
            return Z(b3, e)
        },
        _data: function(b3, e, b4) {
            return ba(b3, e, b4, true)
        },
        _removeData: function(b3, e) {
            return Z(b3, e, true)
        },
        acceptData: function(b3) {
            if (b3.nodeType && b3.nodeType !== 1 && b3.nodeType !== 9) {
                return false
            }
            var e = b3.nodeName && bJ.noData[b3.nodeName.toLowerCase()];
            return !e || e !== true && b3.getAttribute("classid") === e
        }
    });
    bJ.fn.extend({
        data: function(b6, b8) {
            var b7 = null;
            if (typeof b6 === "undefined") {
                if (this.length) {
                    var e = this[0].attributes,
                        b4;
                    b7 = bJ.data(this[0]);
                    for (var b5 = 0, b3 = e.length; b5 < b3; b5++) {
                        b4 = e[b5].name;
                        if (b4.indexOf("data-") === 0) {
                            b4 = b4.substr(5);
                            by(this[0], b4, b7[b4])
                        }
                    }
                }
                return b7
            } else {
                if (typeof b6 === "object") {
                    return this.each(function() {
                        bJ.data(this, b6)
                    })
                }
            }
            var b9 = b6.split(".");
            b9[1] = b9[1] ? "." + b9[1] : "";
            if (b8 === aG) {
                b7 = this.triggerHandler("getData" + b9[1] + "!", [b9[0]]);
                if (b7 === aG && this.length) {
                    b7 = bJ.data(this[0], b6);
                    b7 = by(this[0], b6, b7)
                }
                return b7 === aG && b9[1] ? this.data(b9[0]) : b7
            } else {
                return this.each(function() {
                    var cb = bJ(this),
                        ca = [b9[0], b8];
                    cb.triggerHandler("setData" + b9[1] + "!", ca);
                    bJ.data(this, b6, b8);
                    cb.triggerHandler("changeData" + b9[1] + "!", ca)
                })
            }
        },
        removeData: function(e) {
            return this.each(function() {
                bJ.removeData(this, e)
            })
        }
    });

    function by(b4, b3, b5) {
        if (b5 === aG && b4.nodeType === 1) {
            b5 = b4.getAttribute("data-" + b3);
            if (typeof b5 === "string") {
                try {
                    b5 = b5 === "true" ? true : b5 === "false" ? false : b5 === "null" ? null : !bJ.isNaN(b5) ? parseFloat(b5) : bw.test(b5) ? bJ.parseJSON(b5) : b5
                } catch (b6) {}
                bJ.data(b4, b3, b5)
            } else {
                b5 = aG
            }
        }
        return b5
    }

    function N(b3) {
        var e;
        for (e in b3) {
            if (e === "data" && bJ.isEmptyObject(b3[e])) {
                continue
            }
            if (e !== "toJSON") {
                return false
            }
        }
        return true
    }
    bJ.extend({
        queue: function(b4, b3, b5) {
            var e;
            if (b4) {
                b3 = (b3 || "fx") + "queue";
                e = bJ._data(b4, b3);
                if (b5) {
                    if (!e || bJ.isArray(b5)) {
                        e = bJ._data(b4, b3, bJ.makeArray(b5))
                    } else {
                        e.push(b5)
                    }
                }
                return e || []
            }
        },
        dequeue: function(b7, b6) {
            b6 = b6 || "fx";
            var b3 = bJ.queue(b7, b6),
                b8 = b3.length,
                b5 = b3.shift(),
                e = bJ._queueHooks(b7, b6),
                b4 = function() {
                    bJ.dequeue(b7, b6)
                };
            if (b5 === "inprogress") {
                b5 = b3.shift();
                b8--
            }
            e.cur = b5;
            if (b5) {
                if (b6 === "fx") {
                    b3.unshift("inprogress")
                }
                delete e.stop;
                b5.call(b7, b4, e)
            }
            if (!b8 && e) {
                e.empty.fire()
            }
        },
        _queueHooks: function(b4, b3) {
            var e = b3 + "queueHooks";
            return bJ._data(b4, e) || bJ._data(b4, e, {
                empty: bJ.Callbacks("once memory").add(function() {
                    bJ._removeData(b4, b3 + "queue");
                    bJ._removeData(b4, e)
                })
            })
        }
    });
    bJ.fn.extend({
        queue: function(e, b3) {
            var b4 = 2;
            if (typeof e !== "string") {
                b3 = e;
                e = "fx";
                b4--
            }
            if (arguments.length < b4) {
                return bJ.queue(this[0], e)
            }
            return b3 === aG ? this : this.each(function() {
                var b5 = bJ.queue(this, e, b3);
                bJ._queueHooks(this, e);
                if (e === "fx" && b5[0] !== "inprogress") {
                    bJ.dequeue(this, e)
                }
            })
        },
        dequeue: function(e) {
            return this.each(function() {
                bJ.dequeue(this, e)
            })
        },
        delay: function(b3, e) {
            b3 = bJ.fx ? bJ.fx.speeds[b3] || b3 : b3;
            e = e || "fx";
            return this.queue(e, function(b5, b4) {
                var b6 = setTimeout(b5, b3);
                b4.stop = function() {
                    clearTimeout(b6)
                }
            })
        },
        clearQueue: function(e) {
            return this.queue(e || "fx", [])
        },
        promise: function(b4, b8) {
            var b3, b5 = 1,
                b9 = bJ.Deferred(),
                b7 = this,
                e = this.length,
                b6 = function() {
                    if (!(--b5)) {
                        b9.resolveWith(b7, [b7])
                    }
                };
            if (typeof b4 !== "string") {
                b8 = b4;
                b4 = aG
            }
            b4 = b4 || "fx";
            while (e--) {
                b3 = bJ._data(b7[e], b4 + "queueHooks");
                if (b3 && b3.empty) {
                    b5++;
                    b3.empty.add(b6)
                }
            }
            b6();
            return b9.promise(b8)
        }
    });
    var a8, bZ, bM = /[\t\r\n]/g,
        ak = /\r/g,
        aF = /^(?:input|select|textarea|button|object)$/i,
        D = /^(?:a|area)$/i,
        L = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
        aq = /^(?:checked|selected)$/i,
        bP = bJ.support.getSetAttribute,
        bF = bJ.support.input;
    bJ.fn.extend({
        attr: function(e, b3) {
            return bJ.access(this, bJ.attr, e, b3, arguments.length > 1)
        },
        removeAttr: function(e) {
            return this.each(function() {
                bJ.removeAttr(this, e)
            })
        },
        prop: function(e, b3) {
            return bJ.access(this, bJ.prop, e, b3, arguments.length > 1)
        },
        removeProp: function(e) {
            e = bJ.propFix[e] || e;
            return this.each(function() {
                try {
                    this[e] = aG;
                    delete this[e]
                } catch (b3) {}
            })
        },
        addClass: function(b9) {
            var b3, e, ca, b6, b4, b5 = 0,
                b7 = this.length,
                b8 = typeof b9 === "string" && b9;
            if (bJ.isFunction(b9)) {
                return this.each(function(cb) {
                    bJ(this).addClass(b9.call(this, cb, this.className))
                })
            }
            if (b8) {
                b3 = (b9 || "").match(ac) || [];
                for (; b5 < b7; b5++) {
                    e = this[b5];
                    ca = e.nodeType === 1 && (e.className ? (" " + e.className + " ").replace(bM, " ") : " ");
                    if (ca) {
                        b4 = 0;
                        while ((b6 = b3[b4++])) {
                            if (ca.indexOf(" " + b6 + " ") < 0) {
                                ca += b6 + " "
                            }
                        }
                        e.className = bJ.trim(ca)
                    }
                }
            }
            return this
        },
        removeClass: function(b9) {
            var b3, e, ca, b6, b4, b5 = 0,
                b7 = this.length,
                b8 = arguments.length === 0 || typeof b9 === "string" && b9;
            if (bJ.isFunction(b9)) {
                return this.each(function(cb) {
                    bJ(this).removeClass(b9.call(this, cb, this.className))
                })
            }
            if (b8) {
                b3 = (b9 || "").match(ac) || [];
                for (; b5 < b7; b5++) {
                    e = this[b5];
                    ca = e.nodeType === 1 && (e.className ? (" " + e.className + " ").replace(bM, " ") : "");
                    if (ca) {
                        b4 = 0;
                        while ((b6 = b3[b4++])) {
                            while (ca.indexOf(" " + b6 + " ") >= 0) {
                                ca = ca.replace(" " + b6 + " ", " ")
                            }
                        }
                        e.className = b9 ? bJ.trim(ca) : ""
                    }
                }
            }
            return this
        },
        toggleClass: function(b5, b3) {
            var b4 = typeof b5,
                e = typeof b3 === "boolean";
            if (bJ.isFunction(b5)) {
                return this.each(function(b6) {
                    bJ(this).toggleClass(b5.call(this, b6, this.className, b3), b3)
                })
            }
            return this.each(function() {
                if (b4 === "string") {
                    var b8, b7 = 0,
                        b6 = bJ(this),
                        b9 = b3,
                        ca = b5.match(ac) || [];
                    while ((b8 = ca[b7++])) {
                        b9 = e ? b9 : !b6.hasClass(b8);
                        b6[b9 ? "addClass" : "removeClass"](b8)
                    }
                } else {
                    if (b4 === aC || b4 === "boolean") {
                        if (this.className) {
                            bJ._data(this, "__className__", this.className)
                        }
                        this.className = this.className || b5 === false ? "" : bJ._data(this, "__className__") || ""
                    }
                }
            })
        },
        hasClass: function(e) {
            var b5 = " " + e + " ",
                b4 = 0,
                b3 = this.length;
            for (; b4 < b3; b4++) {
                if (this[b4].nodeType === 1 && (" " + this[b4].className + " ").replace(bM, " ").indexOf(b5) >= 0) {
                    return true
                }
            }
            return false
        },
        val: function(b5) {
            var b3, e, b6, b4 = this[0];
            if (!arguments.length) {
                if (b4) {
                    e = bJ.valHooks[b4.type] || bJ.valHooks[b4.nodeName.toLowerCase()];
                    if (e && "get" in e && (b3 = e.get(b4, "value")) !== aG) {
                        return b3
                    }
                    b3 = b4.value;
                    return typeof b3 === "string" ? b3.replace(ak, "") : b3 == null ? "" : b3
                }
                return
            }
            b6 = bJ.isFunction(b5);
            return this.each(function(b8) {
                var b9, b7 = bJ(this);
                if (this.nodeType !== 1) {
                    return
                }
                if (b6) {
                    b9 = b5.call(this, b8, b7.val())
                } else {
                    b9 = b5
                }
                if (b9 == null) {
                    b9 = ""
                } else {
                    if (typeof b9 === "number") {
                        b9 += ""
                    } else {
                        if (bJ.isArray(b9)) {
                            b9 = bJ.map(b9, function(ca) {
                                return ca == null ? "" : ca + ""
                            })
                        }
                    }
                }
                e = bJ.valHooks[this.type] || bJ.valHooks[this.nodeName.toLowerCase()];
                if (!e || !("set" in e) || e.set(this, b9, "value") === aG) {
                    this.value = b9
                }
            })
        }
    });
    bJ.extend({
        valHooks: {
            option: {
                get: function(e) {
                    var b3 = e.attributes.value;
                    return !b3 || b3.specified ? e.value : e.text
                }
            },
            select: {
                get: function(e) {
                    var b8, b4, ca = e.options,
                        b6 = e.selectedIndex,
                        b5 = e.type === "select-one" || b6 < 0,
                        b9 = b5 ? null : [],
                        b7 = b5 ? b6 + 1 : ca.length,
                        b3 = b6 < 0 ? b7 : b5 ? b6 : 0;
                    for (; b3 < b7; b3++) {
                        b4 = ca[b3];
                        if ((b4.selected || b3 === b6) && (bJ.support.optDisabled ? !b4.disabled : b4.getAttribute("disabled") === null) && (!b4.parentNode.disabled || !bJ.nodeName(b4.parentNode, "optgroup"))) {
                            b8 = bJ(b4).val();
                            if (b5) {
                                return b8
                            }
                            b9.push(b8)
                        }
                    }
                    return b9
                },
                set: function(b3, b4) {
                    var e = bJ.makeArray(b4);
                    bJ(b3).find("option").each(function() {
                        this.selected = bJ.inArray(bJ(this).val(), e) >= 0
                    });
                    if (!e.length) {
                        b3.selectedIndex = -1
                    }
                    return e
                }
            }
        },
        attr: function(b7, b5, b8) {
            var e, b6, b4, b3 = b7.nodeType;
            if (!b7 || b3 === 3 || b3 === 8 || b3 === 2) {
                return
            }
            if (typeof b7.getAttribute === aC) {
                return bJ.prop(b7, b5, b8)
            }
            b6 = b3 !== 1 || !bJ.isXMLDoc(b7);
            if (b6) {
                b5 = b5.toLowerCase();
                e = bJ.attrHooks[b5] || (L.test(b5) ? bZ : a8)
            }
            if (b8 !== aG) {
                if (b8 === null) {
                    bJ.removeAttr(b7, b5)
                } else {
                    if (e && b6 && "set" in e && (b4 = e.set(b7, b8, b5)) !== aG) {
                        return b4
                    } else {
                        b7.setAttribute(b5, b8 + "");
                        return b8
                    }
                }
            } else {
                if (e && b6 && "get" in e && (b4 = e.get(b7, b5)) !== null) {
                    return b4
                } else {
                    if (typeof b7.getAttribute !== aC) {
                        b4 = b7.getAttribute(b5)
                    }
                    return b4 == null ? aG : b4
                }
            }
        },
        removeAttr: function(b4, b6) {
            var e, b5, b3 = 0,
                b7 = b6 && b6.match(ac);
            if (b7 && b4.nodeType === 1) {
                while ((e = b7[b3++])) {
                    b5 = bJ.propFix[e] || e;
                    if (L.test(e)) {
                        if (!bP && aq.test(e)) {
                            b4[bJ.camelCase("default-" + e)] = b4[b5] = false
                        } else {
                            b4[b5] = false
                        }
                    } else {
                        bJ.attr(b4, e, "")
                    }
                    b4.removeAttribute(bP ? e : b5)
                }
            }
        },
        attrHooks: {
            type: {
                set: function(e, b3) {
                    if (!bJ.support.radioValue && b3 === "radio" && bJ.nodeName(e, "input")) {
                        var b4 = e.value;
                        e.setAttribute("type", b3);
                        if (b4) {
                            e.value = b4
                        }
                        return b3
                    }
                }
            }
        },
        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },
        prop: function(b7, b5, b8) {
            var b4, e, b6, b3 = b7.nodeType;
            if (!b7 || b3 === 3 || b3 === 8 || b3 === 2) {
                return
            }
            b6 = b3 !== 1 || !bJ.isXMLDoc(b7);
            if (b6) {
                b5 = bJ.propFix[b5] || b5;
                e = bJ.propHooks[b5]
            }
            if (b8 !== aG) {
                if (e && "set" in e && (b4 = e.set(b7, b8, b5)) !== aG) {
                    return b4
                } else {
                    return (b7[b5] = b8)
                }
            } else {
                if (e && "get" in e && (b4 = e.get(b7, b5)) !== null) {
                    return b4
                } else {
                    return b7[b5]
                }
            }
        },
        propHooks: {
            tabIndex: {
                get: function(b3) {
                    var e = b3.getAttributeNode("tabindex");
                    return e && e.specified ? parseInt(e.value, 10) : aF.test(b3.nodeName) || D.test(b3.nodeName) && b3.href ? 0 : aG
                }
            }
        }
    });
    bZ = {
        get: function(b5, b3) {
            var b6 = bJ.prop(b5, b3),
                e = typeof b6 === "boolean" && b5.getAttribute(b3),
                b4 = typeof b6 === "boolean" ? bF && bP ? e != null : aq.test(b3) ? b5[bJ.camelCase("default-" + b3)] : !!e : b5.getAttributeNode(b3);
            return b4 && b4.value !== false ? b3.toLowerCase() : aG
        },
        set: function(b3, b4, e) {
            if (b4 === false) {
                bJ.removeAttr(b3, e)
            } else {
                if (bF && bP || !aq.test(e)) {
                    b3.setAttribute(!bP && bJ.propFix[e] || e, e)
                } else {
                    b3[bJ.camelCase("default-" + e)] = b3[e] = true
                }
            }
            return e
        }
    };
    if (!bF || !bP) {
        bJ.attrHooks.value = {
            get: function(b4, b3) {
                var e = b4.getAttributeNode(b3);
                return bJ.nodeName(b4, "input") ? b4.defaultValue : e && e.specified ? e.value : aG
            },
            set: function(b3, b4, e) {
                if (bJ.nodeName(b3, "input")) {
                    b3.defaultValue = b4
                } else {
                    return a8 && a8.set(b3, b4, e)
                }
            }
        }
    }
    if (!bP) {
        a8 = bJ.valHooks.button = {
            get: function(b4, b3) {
                var e = b4.getAttributeNode(b3);
                return e && (b3 === "id" || b3 === "name" || b3 === "coords" ? e.value !== "" : e.specified) ? e.value : aG
            },
            set: function(b4, b5, b3) {
                var e = b4.getAttributeNode(b3);
                if (!e) {
                    b4.setAttributeNode((e = b4.ownerDocument.createAttribute(b3)))
                }
                e.value = b5 += "";
                return b3 === "value" || b5 === b4.getAttribute(b3) ? b5 : aG
            }
        };
        bJ.attrHooks.contenteditable = {
            get: a8.get,
            set: function(b3, b4, e) {
                a8.set(b3, b4 === "" ? false : b4, e)
            }
        };
        bJ.each(["width", "height"], function(b3, e) {
            bJ.attrHooks[e] = bJ.extend(bJ.attrHooks[e], {
                set: function(b4, b5) {
                    if (b5 === "") {
                        b4.setAttribute(e, "auto");
                        return b5
                    }
                }
            })
        })
    }
    if (!bJ.support.hrefNormalized) {
        bJ.each(["href", "src", "width", "height"], function(b3, e) {
            bJ.attrHooks[e] = bJ.extend(bJ.attrHooks[e], {
                get: function(b5) {
                    var b4 = b5.getAttribute(e, 2);
                    return b4 == null ? aG : b4
                }
            })
        });
        bJ.each(["href", "src"], function(b3, e) {
            bJ.propHooks[e] = {
                get: function(b4) {
                    return b4.getAttribute(e, 4)
                }
            }
        })
    }
    if (!bJ.support.style) {
        bJ.attrHooks.style = {
            get: function(e) {
                return e.style.cssText || aG
            },
            set: function(e, b3) {
                return (e.style.cssText = b3 + "")
            }
        }
    }
    if (!bJ.support.optSelected) {
        bJ.propHooks.selected = bJ.extend(bJ.propHooks.selected, {
            get: function(b3) {
                var e = b3.parentNode;
                if (e) {
                    e.selectedIndex;
                    if (e.parentNode) {
                        e.parentNode.selectedIndex
                    }
                }
                return null
            }
        })
    }
    if (!bJ.support.enctype) {
        bJ.propFix.enctype = "encoding"
    }
    if (!bJ.support.checkOn) {
        bJ.each(["radio", "checkbox"], function() {
            bJ.valHooks[this] = {
                get: function(e) {
                    return e.getAttribute("value") === null ? "on" : e.value
                }
            }
        })
    }
    bJ.each(["radio", "checkbox"], function() {
        bJ.valHooks[this] = bJ.extend(bJ.valHooks[this], {
            set: function(e, b3) {
                if (bJ.isArray(b3)) {
                    return (e.checked = bJ.inArray(bJ(e).val(), b3) >= 0)
                }
            }
        })
    });
    var bH = /^(?:input|select|textarea)$/i,
        a3 = /^key/,
        bN = /^(?:mouse|contextmenu)|click/,
        bB = /^(?:focusinfocus|focusoutblur)$/,
        bu = /^([^.]*)(?:\.(.+)|)$/;

    function R() {
        return true
    }

    function X() {
        return false
    }
    bJ.event = {
        global: {},
        add: function(b6, cb, cg, b8, b7) {
            var b9, ch, ci, b4, cd, ca, cf, b5, ce, e, b3, cc = bJ._data(b6);
            if (!cc) {
                return
            }
            if (cg.handler) {
                b4 = cg;
                cg = b4.handler;
                b7 = b4.selector
            }
            if (!cg.guid) {
                cg.guid = bJ.guid++
            }
            if (!(ch = cc.events)) {
                ch = cc.events = {}
            }
            if (!(ca = cc.handle)) {
                ca = cc.handle = function(cj) {
                    return typeof bJ !== aC && (!cj || bJ.event.triggered !== cj.type) ? bJ.event.dispatch.apply(ca.elem, arguments) : aG
                };
                ca.elem = b6
            }
            cb = (cb || "").match(ac) || [""];
            ci = cb.length;
            while (ci--) {
                b9 = bu.exec(cb[ci]) || [];
                ce = b3 = b9[1];
                e = (b9[2] || "").split(".").sort();
                cd = bJ.event.special[ce] || {};
                ce = (b7 ? cd.delegateType : cd.bindType) || ce;
                cd = bJ.event.special[ce] || {};
                cf = bJ.extend({
                    type: ce,
                    origType: b3,
                    data: b8,
                    handler: cg,
                    guid: cg.guid,
                    selector: b7,
                    needsContext: b7 && bJ.expr.match.needsContext.test(b7),
                    namespace: e.join(".")
                }, b4);
                if (!(b5 = ch[ce])) {
                    b5 = ch[ce] = [];
                    b5.delegateCount = 0;
                    if (!cd.setup || cd.setup.call(b6, b8, e, ca) === false) {
                        if (b6.addEventListener) {
                            b6.addEventListener(ce, ca, false)
                        } else {
                            if (b6.attachEvent) {
                                b6.attachEvent("on" + ce, ca)
                            }
                        }
                    }
                }
                if (cd.add) {
                    cd.add.call(b6, cf);
                    if (!cf.handler.guid) {
                        cf.handler.guid = cg.guid
                    }
                }
                if (b7) {
                    b5.splice(b5.delegateCount++, 0, cf)
                } else {
                    b5.push(cf)
                }
                bJ.event.global[ce] = true
            }
            b6 = null
        },
        remove: function(b5, cb, ci, b6, ca) {
            var b8, cf, b9, b7, ch, cg, cd, b4, ce, e, b3, cc = bJ.hasData(b5) && bJ._data(b5);
            if (!cc || !(cg = cc.events)) {
                return
            }
            cb = (cb || "").match(ac) || [""];
            ch = cb.length;
            while (ch--) {
                b9 = bu.exec(cb[ch]) || [];
                ce = b3 = b9[1];
                e = (b9[2] || "").split(".").sort();
                if (!ce) {
                    for (ce in cg) {
                        bJ.event.remove(b5, ce + cb[ch], ci, b6, true)
                    }
                    continue
                }
                cd = bJ.event.special[ce] || {};
                ce = (b6 ? cd.delegateType : cd.bindType) || ce;
                b4 = cg[ce] || [];
                b9 = b9[2] && new RegExp("(^|\\.)" + e.join("\\.(?:.*\\.|)") + "(\\.|$)");
                b7 = b8 = b4.length;
                while (b8--) {
                    cf = b4[b8];
                    if ((ca || b3 === cf.origType) && (!ci || ci.guid === cf.guid) && (!b9 || b9.test(cf.namespace)) && (!b6 || b6 === cf.selector || b6 === "**" && cf.selector)) {
                        b4.splice(b8, 1);
                        if (cf.selector) {
                            b4.delegateCount--
                        }
                        if (cd.remove) {
                            cd.remove.call(b5, cf)
                        }
                    }
                }
                if (b7 && !b4.length) {
                    if (!cd.teardown || cd.teardown.call(b5, e, cc.handle) === false) {
                        bJ.removeEvent(b5, ce, cc.handle)
                    }
                    delete cg[ce]
                }
            }
            if (bJ.isEmptyObject(cg)) {
                delete cc.handle;
                bJ._removeData(b5, "events")
            }
        },
        trigger: function(b3, ca, b6, ch) {
            var cb, b5, cf, cg, cd, b9, b8, b7 = [b6 || l],
                ce = V.call(b3, "type") ? b3.type : b3,
                b4 = V.call(b3, "namespace") ? b3.namespace.split(".") : [];
            cf = b9 = b6 = b6 || l;
            if (b6.nodeType === 3 || b6.nodeType === 8) {
                return
            }
            if (bB.test(ce + bJ.event.triggered)) {
                return
            }
            if (ce.indexOf(".") >= 0) {
                b4 = ce.split(".");
                ce = b4.shift();
                b4.sort()
            }
            b5 = ce.indexOf(":") < 0 && "on" + ce;
            b3 = b3[bJ.expando] ? b3 : new bJ.Event(ce, typeof b3 === "object" && b3);
            b3.isTrigger = true;
            b3.namespace = b4.join(".");
            b3.namespace_re = b3.namespace ? new RegExp("(^|\\.)" + b4.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            b3.result = aG;
            if (!b3.target) {
                b3.target = b6
            }
            ca = ca == null ? [b3] : bJ.makeArray(ca, [b3]);
            cd = bJ.event.special[ce] || {};
            if (!ch && cd.trigger && cd.trigger.apply(b6, ca) === false) {
                return
            }
            if (!ch && !cd.noBubble && !bJ.isWindow(b6)) {
                cg = cd.delegateType || ce;
                if (!bB.test(cg + ce)) {
                    cf = cf.parentNode
                }
                for (; cf; cf = cf.parentNode) {
                    b7.push(cf);
                    b9 = cf
                }
                if (b9 === (b6.ownerDocument || l)) {
                    b7.push(b9.defaultView || b9.parentWindow || a2)
                }
            }
            b8 = 0;
            while ((cf = b7[b8++]) && !b3.isPropagationStopped()) {
                b3.type = b8 > 1 ? cg : cd.bindType || ce;
                cb = (bJ._data(cf, "events") || {})[b3.type] && bJ._data(cf, "handle");
                if (cb) {
                    cb.apply(cf, ca)
                }
                cb = b5 && cf[b5];
                if (cb && bJ.acceptData(cf) && cb.apply && cb.apply(cf, ca) === false) {
                    b3.preventDefault()
                }
            }
            b3.type = ce;
            if (!ch && !b3.isDefaultPrevented()) {
                if ((!cd._default || cd._default.apply(b6.ownerDocument, ca) === false) && !(ce === "click" && bJ.nodeName(b6, "a")) && bJ.acceptData(b6)) {
                    if (b5 && b6[ce] && !bJ.isWindow(b6)) {
                        b9 = b6[b5];
                        if (b9) {
                            b6[b5] = null
                        }
                        bJ.event.triggered = ce;
                        try {
                            b6[ce]()
                        } catch (cc) {}
                        bJ.event.triggered = aG;
                        if (b9) {
                            b6[b5] = b9
                        }
                    }
                }
            }
            return b3.result
        },
        dispatch: function(e) {
            e = bJ.event.fix(e);
            var b6, b7, cb, b3, b5, ca = [],
                b9 = a4.call(arguments),
                b4 = (bJ._data(this, "events") || {})[e.type] || [],
                b8 = bJ.event.special[e.type] || {};
            b9[0] = e;
            e.delegateTarget = this;
            if (b8.preDispatch && b8.preDispatch.call(this, e) === false) {
                return
            }
            ca = bJ.event.handlers.call(this, e, b4);
            b6 = 0;
            while ((b3 = ca[b6++]) && !e.isPropagationStopped()) {
                e.currentTarget = b3.elem;
                b5 = 0;
                while ((cb = b3.handlers[b5++]) && !e.isImmediatePropagationStopped()) {
                    if (!e.namespace_re || e.namespace_re.test(cb.namespace)) {
                        e.handleObj = cb;
                        e.data = cb.data;
                        b7 = ((bJ.event.special[cb.origType] || {}).handle || cb.handler).apply(b3.elem, b9);
                        if (b7 !== aG) {
                            if ((e.result = b7) === false) {
                                e.preventDefault();
                                e.stopPropagation()
                            }
                        }
                    }
                }
            }
            if (b8.postDispatch) {
                b8.postDispatch.call(this, e)
            }
            return e.result
        },
        handlers: function(e, b4) {
            var b3, b9, b7, b6, b8 = [],
                b5 = b4.delegateCount,
                ca = e.target;
            if (b5 && ca.nodeType && (!e.button || e.type !== "click")) {
                for (; ca != this; ca = ca.parentNode || this) {
                    if (ca.nodeType === 1 && (ca.disabled !== true || e.type !== "click")) {
                        b7 = [];
                        for (b6 = 0; b6 < b5; b6++) {
                            b9 = b4[b6];
                            b3 = b9.selector + " ";
                            if (b7[b3] === aG) {
                                b7[b3] = b9.needsContext ? bJ(b3, this).index(ca) >= 0 : bJ.find(b3, this, null, [ca]).length
                            }
                            if (b7[b3]) {
                                b7.push(b9)
                            }
                        }
                        if (b7.length) {
                            b8.push({
                                elem: ca,
                                handlers: b7
                            })
                        }
                    }
                }
            }
            if (b5 < b4.length) {
                b8.push({
                    elem: this,
                    handlers: b4.slice(b5)
                })
            }
            return b8
        },
        fix: function(b5) {
            if (b5[bJ.expando]) {
                return b5
            }
            var b3, b8, b7, b4 = b5.type,
                e = b5,
                b6 = this.fixHooks[b4];
            if (!b6) {
                this.fixHooks[b4] = b6 = bN.test(b4) ? this.mouseHooks : a3.test(b4) ? this.keyHooks : {}
            }
            b7 = b6.props ? this.props.concat(b6.props) : this.props;
            b5 = new bJ.Event(e);
            b3 = b7.length;
            while (b3--) {
                b8 = b7[b3];
                b5[b8] = e[b8]
            }
            if (!b5.target) {
                b5.target = e.srcElement || l
            }
            if (b5.target.nodeType === 3) {
                b5.target = b5.target.parentNode
            }
            b5.metaKey = !!b5.metaKey;
            return b6.filter ? b6.filter(b5, e) : b5
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(b3, e) {
                if (b3.which == null) {
                    b3.which = e.charCode != null ? e.charCode : e.keyCode
                }
                return b3
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(b5, b4) {
                var e, b6, b7, b3 = b4.button,
                    b8 = b4.fromElement;
                if (b5.pageX == null && b4.clientX != null) {
                    b6 = b5.target.ownerDocument || l;
                    b7 = b6.documentElement;
                    e = b6.body;
                    b5.pageX = b4.clientX + (b7 && b7.scrollLeft || e && e.scrollLeft || 0) - (b7 && b7.clientLeft || e && e.clientLeft || 0);
                    b5.pageY = b4.clientY + (b7 && b7.scrollTop || e && e.scrollTop || 0) - (b7 && b7.clientTop || e && e.clientTop || 0)
                }
                if (!b5.relatedTarget && b8) {
                    b5.relatedTarget = b8 === b5.target ? b4.toElement : b8
                }
                if (!b5.which && b3 !== aG) {
                    b5.which = (b3 & 1 ? 1 : (b3 & 2 ? 3 : (b3 & 4 ? 2 : 0)))
                }
                return b5
            }
        },
        special: {
            load: {
                noBubble: true
            },
            click: {
                trigger: function() {
                    if (bJ.nodeName(this, "input") && this.type === "checkbox" && this.click) {
                        this.click();
                        return false
                    }
                }
            },
            focus: {
                trigger: function() {
                    if (this !== l.activeElement && this.focus) {
                        try {
                            this.focus();
                            return false
                        } catch (b3) {}
                    }
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    if (this === l.activeElement && this.blur) {
                        this.blur();
                        return false
                    }
                },
                delegateType: "focusout"
            },
            beforeunload: {
                postDispatch: function(e) {
                    if (e.result !== aG) {
                        e.originalEvent.returnValue = e.result
                    }
                }
            }
        },
        simulate: function(b4, b6, b5, b3) {
            var b7 = bJ.extend(new bJ.Event(), b5, {
                type: b4,
                isSimulated: true,
                originalEvent: {}
            });
            if (b3) {
                bJ.event.trigger(b7, null, b6)
            } else {
                bJ.event.dispatch.call(b6, b7)
            }
            if (b7.isDefaultPrevented()) {
                b5.preventDefault()
            }
        }
    };
    bJ.removeEvent = l.removeEventListener ? function(b3, e, b4) {
        if (b3.removeEventListener) {
            b3.removeEventListener(e, b4, false)
        }
    } : function(b4, b3, b5) {
        var e = "on" + b3;
        if (b4.detachEvent) {
            if (typeof b4[e] === aC) {
                b4[e] = null
            }
            b4.detachEvent(e, b5)
        }
    };
    bJ.Event = function(b3, e) {
        if (!(this instanceof bJ.Event)) {
            return new bJ.Event(b3, e)
        }
        if (b3 && b3.type) {
            this.originalEvent = b3;
            this.type = b3.type;
            this.isDefaultPrevented = (b3.defaultPrevented || b3.returnValue === false || b3.getPreventDefault && b3.getPreventDefault()) ? R : X
        } else {
            this.type = b3
        }
        if (e) {
            bJ.extend(this, e)
        }
        this.timeStamp = b3 && b3.timeStamp || bJ.now();
        this[bJ.expando] = true
    };
    bJ.Event.prototype = {
        isDefaultPrevented: X,
        isPropagationStopped: X,
        isImmediatePropagationStopped: X,
        preventDefault: function() {
            var b3 = this.originalEvent;
            this.isDefaultPrevented = R;
            if (!b3) {
                return
            }
            if (b3.preventDefault) {
                b3.preventDefault()
            } else {
                b3.returnValue = false
            }
        },
        stopPropagation: function() {
            var b3 = this.originalEvent;
            this.isPropagationStopped = R;
            if (!b3) {
                return
            }
            if (b3.stopPropagation) {
                b3.stopPropagation()
            }
            b3.cancelBubble = true
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = R;
            this.stopPropagation()
        }
    };
    bJ.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(b3, e) {
        bJ.event.special[b3] = {
            delegateType: e,
            bindType: e,
            handle: function(b6) {
                var b4, b8 = this,
                    b7 = b6.relatedTarget,
                    b5 = b6.handleObj;
                if (!b7 || (b7 !== b8 && !bJ.contains(b8, b7))) {
                    b6.type = b5.origType;
                    b4 = b5.handler.apply(this, arguments);
                    b6.type = e
                }
                return b4
            }
        }
    });
    if (!bJ.support.submitBubbles) {
        bJ.event.special.submit = {
            setup: function() {
                if (bJ.nodeName(this, "form")) {
                    return false
                }
                bJ.event.add(this, "click._submit keypress._submit", function(b5) {
                    var b4 = b5.target,
                        b3 = bJ.nodeName(b4, "input") || bJ.nodeName(b4, "button") ? b4.form : aG;
                    if (b3 && !bJ._data(b3, "submitBubbles")) {
                        bJ.event.add(b3, "submit._submit", function(e) {
                            e._submit_bubble = true
                        });
                        bJ._data(b3, "submitBubbles", true)
                    }
                })
            },
            postDispatch: function(e) {
                if (e._submit_bubble) {
                    delete e._submit_bubble;
                    if (this.parentNode && !e.isTrigger) {
                        bJ.event.simulate("submit", this.parentNode, e, true)
                    }
                }
            },
            teardown: function() {
                if (bJ.nodeName(this, "form")) {
                    return false
                }
                bJ.event.remove(this, "._submit")
            }
        }
    }
    if (!bJ.support.changeBubbles) {
        bJ.event.special.change = {
            setup: function() {
                if (bH.test(this.nodeName)) {
                    if (this.type === "checkbox" || this.type === "radio") {
                        bJ.event.add(this, "propertychange._change", function(e) {
                            if (e.originalEvent.propertyName === "checked") {
                                this._just_changed = true
                            }
                        });
                        bJ.event.add(this, "click._change", function(e) {
                            if (this._just_changed && !e.isTrigger) {
                                this._just_changed = false
                            }
                            bJ.event.simulate("change", this, e, true)
                        })
                    }
                    return false
                }
                bJ.event.add(this, "beforeactivate._change", function(b4) {
                    var b3 = b4.target;
                    if (bH.test(b3.nodeName) && !bJ._data(b3, "changeBubbles")) {
                        bJ.event.add(b3, "change._change", function(e) {
                            if (this.parentNode && !e.isSimulated && !e.isTrigger) {
                                bJ.event.simulate("change", this.parentNode, e, true)
                            }
                        });
                        bJ._data(b3, "changeBubbles", true)
                    }
                })
            },
            handle: function(b3) {
                var e = b3.target;
                if (this !== e || b3.isSimulated || b3.isTrigger || (e.type !== "radio" && e.type !== "checkbox")) {
                    return b3.handleObj.handler.apply(this, arguments)
                }
            },
            teardown: function() {
                bJ.event.remove(this, "._change");
                return !bH.test(this.nodeName)
            }
        }
    }
    if (!bJ.support.focusinBubbles) {
        bJ.each({
            focus: "focusin",
            blur: "focusout"
        }, function(b5, e) {
            var b3 = 0,
                b4 = function(b6) {
                    bJ.event.simulate(e, b6.target, bJ.event.fix(b6), true)
                };
            bJ.event.special[e] = {
                setup: function() {
                    if (b3++ === 0) {
                        l.addEventListener(b5, b4, true)
                    }
                },
                teardown: function() {
                    if (--b3 === 0) {
                        l.removeEventListener(b5, b4, true)
                    }
                }
            }
        })
    }
    bJ.fn.extend({
        on: function(b4, e, b7, b6, b3) {
            var b5, b8;
            if (typeof b4 === "object") {
                if (typeof e !== "string") {
                    b7 = b7 || e;
                    e = aG
                }
                for (b5 in b4) {
                    this.on(b5, e, b7, b4[b5], b3)
                }
                return this
            }
            if (b7 == null && b6 == null) {
                b6 = e;
                b7 = e = aG
            } else {
                if (b6 == null) {
                    if (typeof e === "string") {
                        b6 = b7;
                        b7 = aG
                    } else {
                        b6 = b7;
                        b7 = e;
                        e = aG
                    }
                }
            }
            if (b6 === false) {
                b6 = X
            } else {
                if (!b6) {
                    return this
                }
            }
            if (b3 === 1) {
                b8 = b6;
                b6 = function(b9) {
                    bJ().off(b9);
                    return b8.apply(this, arguments)
                };
                b6.guid = b8.guid || (b8.guid = bJ.guid++)
            }
            return this.each(function() {
                bJ.event.add(this, b4, b6, b7, e)
            })
        },
        one: function(b3, e, b5, b4) {
            return this.on(b3, e, b5, b4, 1)
        },
        off: function(b4, e, b6) {
            var b3, b5;
            if (b4 && b4.preventDefault && b4.handleObj) {
                b3 = b4.handleObj;
                bJ(b4.delegateTarget).off(b3.namespace ? b3.origType + "." + b3.namespace : b3.origType, b3.selector, b3.handler);
                return this
            }
            if (typeof b4 === "object") {
                for (b5 in b4) {
                    this.off(b5, e, b4[b5])
                }
                return this
            }
            if (e === false || typeof e === "function") {
                b6 = e;
                e = aG
            }
            if (b6 === false) {
                b6 = X
            }
            return this.each(function() {
                bJ.event.remove(this, b4, b6, e)
            })
        },
        bind: function(e, b4, b3) {
            return this.on(e, null, b4, b3)
        },
        unbind: function(e, b3) {
            return this.off(e, null, b3)
        },
        delegate: function(e, b3, b5, b4) {
            return this.on(b3, e, b5, b4)
        },
        undelegate: function(e, b3, b4) {
            return arguments.length === 1 ? this.off(e, "**") : this.off(b3, e || "**", b4)
        },
        trigger: function(e, b3) {
            return this.each(function() {
                bJ.event.trigger(e, b3, this)
            })
        },
        triggerHandler: function(e, b4) {
            var b3 = this[0];
            if (b3) {
                return bJ.event.trigger(e, b4, b3, true)
            }
        }
    });
    /*!
     * Sizzle CSS Selector Engine
     * Copyright 2012 jQuery Foundation and other contributors
     * Released under the MIT license
     * http://sizzlejs.com/
     */
    (function(da, ch) {
        var cx, cb, cn, cH, cJ, cS, cT, dg, cV, cB, co, cd, cZ, db, ca, cF, cD, c5 = "sizzle" + -(new Date()),
            cI = da.document,
            dd = {},
            de = 0,
            c0 = 0,
            b5 = cz(),
            c4 = cz(),
            cG = cz(),
            c9 = typeof ch,
            cN = 1 << 31,
            c7 = [],
            c8 = c7.pop,
            b4 = c7.push,
            cm = c7.slice,
            b9 = c7.indexOf || function(di) {
                var dh = 0,
                    e = this.length;
                for (; dh < e; dh++) {
                    if (this[dh] === di) {
                        return dh
                    }
                }
                return -1
            },
            cp = "[\\x20\\t\\r\\n\\f]",
            b3 = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
            cK = b3.replace("w", "w#"),
            ci = "([*^$|!~]?=)",
            c2 = "\\[" + cp + "*(" + b3 + ")" + cp + "*(?:" + ci + cp + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + cK + ")|)|)" + cp + "*\\]",
            ck = ":(" + b3 + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + c2.replace(3, 8) + ")*)|.*)\\)|)",
            cr = new RegExp("^" + cp + "+|((?:^|[^\\\\])(?:\\\\.)*)" + cp + "+$", "g"),
            cu = new RegExp("^" + cp + "*," + cp + "*"),
            cA = new RegExp("^" + cp + "*([\\x20\\t\\r\\n\\f>+~])" + cp + "*"),
            cP = new RegExp(ck),
            cQ = new RegExp("^" + cK + "$"),
            cY = {
                ID: new RegExp("^#(" + b3 + ")"),
                CLASS: new RegExp("^\\.(" + b3 + ")"),
                NAME: new RegExp("^\\[name=['\"]?(" + b3 + ")['\"]?\\]"),
                TAG: new RegExp("^(" + b3.replace("w", "w*") + ")"),
                ATTR: new RegExp("^" + c2),
                PSEUDO: new RegExp("^" + ck),
                CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + cp + "*(even|odd|(([+-]|)(\\d*)n|)" + cp + "*(?:([+-]|)" + cp + "*(\\d+)|))" + cp + "*\\)|)", "i"),
                needsContext: new RegExp("^" + cp + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + cp + "*((?:-\\d)?\\d*)" + cp + "*\\)|)(?=[^-]|$)", "i")
            },
            cW = /[\x20\t\r\n\f]*[+~]/,
            cM = /^[^{]+\{\s*\[native code/,
            cO = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
            b8 = /^(?:input|select|textarea|button)$/i,
            cl = /^h\d$/i,
            cL = /'|\\/g,
            ct = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,
            cs = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
            c1 = function(e, di) {
                var dh = "0x" + di - 65536;
                return dh !== dh ? di : dh < 0 ? String.fromCharCode(dh + 65536) : String.fromCharCode(dh >> 10 | 55296, dh & 1023 | 56320)
            };
        try {
            cm.call(cI.documentElement.childNodes, 0)[0].nodeType
        } catch (cC) {
            cm = function(dh) {
                var di, e = [];
                while ((di = this[dh++])) {
                    e.push(di)
                }
                return e
            }
        }

        function cE(e) {
            return cM.test(e + "")
        }

        function cz() {
            var e, dh = [];
            return (e = function(di, dj) {
                if (dh.push(di += " ") > cn.cacheLength) {
                    delete e[dh.shift()]
                }
                return (e[di] = dj)
            })
        }

        function cj(e) {
            e[c5] = true;
            return e
        }

        function cc(dh) {
            var dj = cB.createElement("div");
            try {
                return dh(dj)
            } catch (di) {
                return false
            } finally {
                dj = null
            }
        }

        function cv(dp, dh, dt, dv) {
            var du, dl, dm, dr, ds, dk, dj, e, di, dq;
            if ((dh ? dh.ownerDocument || dh : cI) !== cB) {
                cV(dh)
            }
            dh = dh || cB;
            dt = dt || [];
            if (!dp || typeof dp !== "string") {
                return dt
            }
            if ((dr = dh.nodeType) !== 1 && dr !== 9) {
                return []
            }
            if (!cd && !dv) {
                if ((du = cO.exec(dp))) {
                    if ((dm = du[1])) {
                        if (dr === 9) {
                            dl = dh.getElementById(dm);
                            if (dl && dl.parentNode) {
                                if (dl.id === dm) {
                                    dt.push(dl);
                                    return dt
                                }
                            } else {
                                return dt
                            }
                        } else {
                            if (dh.ownerDocument && (dl = dh.ownerDocument.getElementById(dm)) && cF(dh, dl) && dl.id === dm) {
                                dt.push(dl);
                                return dt
                            }
                        }
                    } else {
                        if (du[2]) {
                            b4.apply(dt, cm.call(dh.getElementsByTagName(dp), 0));
                            return dt
                        } else {
                            if ((dm = du[3]) && dd.getByClassName && dh.getElementsByClassName) {
                                b4.apply(dt, cm.call(dh.getElementsByClassName(dm), 0));
                                return dt
                            }
                        }
                    }
                }
                if (dd.qsa && !cZ.test(dp)) {
                    dj = true;
                    e = c5;
                    di = dh;
                    dq = dr === 9 && dp;
                    if (dr === 1 && dh.nodeName.toLowerCase() !== "object") {
                        dk = cf(dp);
                        if ((dj = dh.getAttribute("id"))) {
                            e = dj.replace(cL, "\\$&")
                        } else {
                            dh.setAttribute("id", e)
                        }
                        e = "[id='" + e + "'] ";
                        ds = dk.length;
                        while (ds--) {
                            dk[ds] = e + cg(dk[ds])
                        }
                        di = cW.test(dp) && dh.parentNode || dh;
                        dq = dk.join(",")
                    }
                    if (dq) {
                        try {
                            b4.apply(dt, cm.call(di.querySelectorAll(dq), 0));
                            return dt
                        } catch (dn) {} finally {
                            if (!dj) {
                                dh.removeAttribute("id")
                            }
                        }
                    }
                }
            }
            return dc(dp.replace(cr, "$1"), dh, dt, dv)
        }
        cJ = cv.isXML = function(e) {
            var dh = e && (e.ownerDocument || e).documentElement;
            return dh ? dh.nodeName !== "HTML" : false
        };
        cV = cv.setDocument = function(e) {
            var dh = e ? e.ownerDocument || e : cI;
            if (dh === cB || dh.nodeType !== 9 || !dh.documentElement) {
                return cB
            }
            cB = dh;
            co = dh.documentElement;
            cd = cJ(dh);
            dd.tagNameNoComments = cc(function(di) {
                di.appendChild(dh.createComment(""));
                return !di.getElementsByTagName("*").length
            });
            dd.attributes = cc(function(dj) {
                TVA.putInnerHTML(dj, "<select></select>");
                var di = typeof dj.lastChild.getAttribute("multiple");
                return di !== "boolean" && di !== "string"
            });
            dd.getByClassName = cc(function(di) {
                TVA.putInnerHTML(di, "<div class='hidden e'></div><div class='hidden'></div>");
                if (!di.getElementsByClassName || !di.getElementsByClassName("e").length) {
                    return false
                }
                di.lastChild.className = "e";
                return di.getElementsByClassName("e").length === 2
            });
            dd.getByName = cc(function(dk) {
                dk.id = c5 + 0;
                TVA.putInnerHTML(dk, "<a name='" + c5 + "'></a><div name='" + c5 + "'></div>");
                co.insertBefore(dk, co.firstChild);
                var dj = dh.getElementsByName && dh.getElementsByName(c5).length === 2 + dh.getElementsByName(c5 + 0).length;
                dd.getIdNotName = !dh.getElementById(c5);
                var di = co.removeChild(dk);
                return dj
            });
            cn.attrHandle = cc(function(di) {
                TVA.putInnerHTML(di, "<a href='#'></a>");
                return di.firstChild && typeof di.firstChild.getAttribute !== c9 && di.firstChild.getAttribute("href") === "#"
            }) ? {} : {
                href: function(di) {
                    return di.getAttribute("href", 2)
                },
                type: function(di) {
                    return di.getAttribute("type")
                }
            };
            if (dd.getIdNotName) {
                cn.find.ID = function(dk, dj) {
                    if (typeof dj.getElementById !== c9 && !cd) {
                        var di = dj.getElementById(dk);
                        return di && di.parentNode ? [di] : []
                    }
                };
                cn.filter.ID = function(dj) {
                    var di = dj.replace(cs, c1);
                    return function(dk) {
                        return dk.getAttribute("id") === di
                    }
                }
            } else {
                cn.find.ID = function(dk, dj) {
                    if (typeof dj.getElementById !== c9 && !cd) {
                        var di = dj.getElementById(dk);
                        return di ? di.id === dk || typeof di.getAttributeNode !== c9 && di.getAttributeNode("id").value === dk ? [di] : ch : []
                    }
                };
                cn.filter.ID = function(dj) {
                    var di = dj.replace(cs, c1);
                    return function(dl) {
                        var dk = typeof dl.getAttributeNode !== c9 && dl.getAttributeNode("id");
                        return dk && dk.value === di
                    }
                }
            }
            cn.find.TAG = dd.tagNameNoComments ? function(di, dj) {
                if (typeof dj.getElementsByTagName !== c9) {
                    return dj.getElementsByTagName(di)
                }
            } : function(di, dm) {
                var dn, dl = [],
                    dk = 0,
                    dj = dm.getElementsByTagName(di);
                if (di === "*") {
                    while ((dn = dj[dk++])) {
                        if (dn.nodeType === 1) {
                            dl.push(dn)
                        }
                    }
                    return dl
                }
                return dj
            };
            cn.find.NAME = dd.getByName && function(di, dj) {
                if (typeof dj.getElementsByName !== c9) {
                    return dj.getElementsByName(name)
                }
            };
            cn.find.CLASS = dd.getByClassName && function(dj, di) {
                if (typeof di.getElementsByClassName !== c9 && !cd) {
                    return di.getElementsByClassName(dj)
                }
            };
            db = [];
            cZ = [":focus"];
            if ((dd.qsa = cE(dh.querySelectorAll))) {
                cc(function(di) {
                    TVA.putInnerHTML(di, "<select><option selected=''></option></select>");
                    if (!di.querySelectorAll("[selected]").length) {
                        cZ.push("\\[" + cp + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)")
                    }
                    if (!di.querySelectorAll(":checked").length) {
                        cZ.push(":checked")
                    }
                });
                cc(function(di) {
                    TVA.putInnerHTML(di, "<input type='hidden' i=''/>");
                    if (di.querySelectorAll("[i^='']").length) {
                        cZ.push("[*^$]=" + cp + "*(?:\"\"|'')")
                    }
                    if (!di.querySelectorAll(":enabled").length) {
                        cZ.push(":enabled", ":disabled")
                    }
                    di.querySelectorAll("*,:x");
                    cZ.push(",.*:")
                })
            }
            if ((dd.matchesSelector = cE((ca = co.matchesSelector || co.mozMatchesSelector || co.webkitMatchesSelector || co.oMatchesSelector || co.msMatchesSelector)))) {
                cc(function(di) {
                    dd.disconnectedMatch = ca.call(di, "div");
                    ca.call(di, "[s!='']:x");
                    db.push("!=", ck)
                })
            }
            cZ = new RegExp(cZ.join("|"));
            db = new RegExp(db.join("|"));
            cF = cE(co.contains) || co.compareDocumentPosition ? function(dj, di) {
                var dl = dj.nodeType === 9 ? dj.documentElement : dj,
                    dk = di && di.parentNode;
                return dj === dk || !!(dk && dk.nodeType === 1 && (dl.contains ? dl.contains(dk) : dj.compareDocumentPosition && dj.compareDocumentPosition(dk) & 16))
            } : function(dj, di) {
                if (di) {
                    while ((di = di.parentNode)) {
                        if (di === dj) {
                            return true
                        }
                    }
                }
                return false
            };
            cD = co.compareDocumentPosition ? function(dj, di) {
                var dk;
                if (dj === di) {
                    cT = true;
                    return 0
                }
                if ((dk = di.compareDocumentPosition && dj.compareDocumentPosition && dj.compareDocumentPosition(di))) {
                    if (dk & 1 || dj.parentNode && dj.parentNode.nodeType === 11) {
                        if (dj === dh || cF(cI, dj)) {
                            return -1
                        }
                        if (di === dh || cF(cI, di)) {
                            return 1
                        }
                        return 0
                    }
                    return dk & 4 ? -1 : 1
                }
                return dj.compareDocumentPosition ? -1 : 1
            } : function(dj, di) {
                var dq, dm = 0,
                    dp = dj.parentNode,
                    dl = di.parentNode,
                    dk = [dj],
                    dn = [di];
                if (dj === di) {
                    cT = true;
                    return 0
                } else {
                    if (!dp || !dl) {
                        return dj === dh ? -1 : di === dh ? 1 : dp ? -1 : dl ? 1 : 0
                    } else {
                        if (dp === dl) {
                            return b6(dj, di)
                        }
                    }
                }
                dq = dj;
                while ((dq = dq.parentNode)) {
                    dk.unshift(dq)
                }
                dq = di;
                while ((dq = dq.parentNode)) {
                    dn.unshift(dq)
                }
                while (dk[dm] === dn[dm]) {
                    dm++
                }
                return dm ? b6(dk[dm], dn[dm]) : dk[dm] === cI ? -1 : dn[dm] === cI ? 1 : 0
            };
            cT = false;
            [0, 0].sort(cD);
            dd.detectDuplicates = cT;
            return cB
        };
        cv.matches = function(dh, e) {
            return cv(dh, null, null, e)
        };
        cv.matchesSelector = function(di, dk) {
            if ((di.ownerDocument || di) !== cB) {
                cV(di)
            }
            dk = dk.replace(ct, "='$1']");
            if (dd.matchesSelector && !cd && (!db || !db.test(dk)) && !cZ.test(dk)) {
                try {
                    var dh = ca.call(di, dk);
                    if (dh || dd.disconnectedMatch || di.document && di.document.nodeType !== 11) {
                        return dh
                    }
                } catch (dj) {}
            }
            return cv(dk, cB, null, [di]).length > 0
        };
        cv.contains = function(e, dh) {
            if ((e.ownerDocument || e) !== cB) {
                cV(e)
            }
            return cF(e, dh)
        };
        cv.attr = function(dh, e) {
            var di;
            if ((dh.ownerDocument || dh) !== cB) {
                cV(dh)
            }
            if (!cd) {
                e = e.toLowerCase()
            }
            if ((di = cn.attrHandle[e])) {
                return di(dh)
            }
            if (cd || dd.attributes) {
                return dh.getAttribute(e)
            }
            return ((di = dh.getAttributeNode(e)) || dh.getAttribute(e)) && dh[e] === true ? e : di && di.specified ? di.value : null
        };
        cv.error = function(e) {
            throw new Error("Syntax error, unrecognized expression: " + e)
        };
        cv.uniqueSort = function(di) {
            var dj, dk = [],
                dh = 1,
                e = 0;
            cT = !dd.detectDuplicates;
            di.sort(cD);
            if (cT) {
                for (;
                    (dj = di[dh]); dh++) {
                    if (dj === di[dh - 1]) {
                        e = dk.push(dh)
                    }
                }
                while (e--) {
                    di.splice(dk[e], 1)
                }
            }
            return di
        };

        function b6(dh, e) {
            var dj = e && dh,
                di = dj && (~e.sourceIndex || cN) - (~dh.sourceIndex || cN);
            if (di) {
                return di
            }
            if (dj) {
                while ((dj = dj.nextSibling)) {
                    if (dj === e) {
                        return -1
                    }
                }
            }
            return dh ? 1 : -1
        }

        function cw(e) {
            return function(di) {
                var dh = di.nodeName.toLowerCase();
                return dh === "input" && di.type === e
            }
        }

        function b7(e) {
            return function(di) {
                var dh = di.nodeName.toLowerCase();
                return (dh === "input" || dh === "button") && di.type === e
            }
        }

        function c3(e) {
            return cj(function(dh) {
                dh = +dh;
                return cj(function(di, dm) {
                    var dk, dj = e([], di.length, dh),
                        dl = dj.length;
                    while (dl--) {
                        if (di[(dk = dj[dl])]) {
                            di[dk] = !(dm[dk] = di[dk])
                        }
                    }
                })
            })
        }
        cH = cv.getText = function(dk) {
            var dj, dh = "",
                di = 0,
                e = dk.nodeType;
            if (!e) {
                for (;
                    (dj = dk[di]); di++) {
                    dh += cH(dj)
                }
            } else {
                if (e === 1 || e === 9 || e === 11) {
                    if (typeof dk.textContent === "string") {
                        return dk.textContent
                    } else {
                        for (dk = dk.firstChild; dk; dk = dk.nextSibling) {
                            dh += cH(dk)
                        }
                    }
                } else {
                    if (e === 3 || e === 4) {
                        return dk.nodeValue
                    }
                }
            }
            return dh
        };
        cn = cv.selectors = {
            cacheLength: 50,
            createPseudo: cj,
            match: cY,
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: true
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: true
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(e) {
                    e[1] = e[1].replace(cs, c1);
                    e[3] = (e[4] || e[5] || "").replace(cs, c1);
                    if (e[2] === "~=") {
                        e[3] = " " + e[3] + " "
                    }
                    return e.slice(0, 4)
                },
                CHILD: function(e) {
                    e[1] = e[1].toLowerCase();
                    if (e[1].slice(0, 3) === "nth") {
                        if (!e[3]) {
                            cv.error(e[0])
                        }
                        e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * (e[3] === "even" || e[3] === "odd"));
                        e[5] = +((e[7] + e[8]) || e[3] === "odd")
                    } else {
                        if (e[3]) {
                            cv.error(e[0])
                        }
                    }
                    return e
                },
                PSEUDO: function(dh) {
                    var e, di = !dh[5] && dh[2];
                    if (cY.CHILD.test(dh[0])) {
                        return null
                    }
                    if (dh[4]) {
                        dh[2] = dh[4]
                    } else {
                        if (di && cP.test(di) && (e = cf(di, true)) && (e = di.indexOf(")", di.length - e) - di.length)) {
                            dh[0] = dh[0].slice(0, e);
                            dh[2] = di.slice(0, e)
                        }
                    }
                    return dh.slice(0, 3)
                }
            },
            filter: {
                TAG: function(e) {
                    if (e === "*") {
                        return function() {
                            return true
                        }
                    }
                    e = e.replace(cs, c1).toLowerCase();
                    return function(dh) {
                        return dh.nodeName && dh.nodeName.toLowerCase() === e
                    }
                },
                CLASS: function(e) {
                    var dh = b5[e + " "];
                    return dh || (dh = new RegExp("(^|" + cp + ")" + e + "(" + cp + "|$)")) && b5(e, function(di) {
                        return dh.test(di.className || (typeof di.getAttribute !== c9 && di.getAttribute("class")) || "")
                    })
                },
                ATTR: function(di, dh, e) {
                    return function(dk) {
                        var dj = cv.attr(dk, di);
                        if (dj == null) {
                            return dh === "!="
                        }
                        if (!dh) {
                            return true
                        }
                        dj += "";
                        return dh === "=" ? dj === e : dh === "!=" ? dj !== e : dh === "^=" ? e && dj.indexOf(e) === 0 : dh === "*=" ? e && dj.indexOf(e) > -1 : dh === "$=" ? e && dj.slice(-e.length) === e : dh === "~=" ? (" " + dj + " ").indexOf(e) > -1 : dh === "|=" ? dj === e || dj.slice(0, e.length + 1) === e + "-" : false
                    }
                },
                CHILD: function(dh, dk, dj, dl, di) {
                    var dn = dh.slice(0, 3) !== "nth",
                        e = dh.slice(-4) !== "last",
                        dm = dk === "of-type";
                    return dl === 1 && di === 0 ? function(dp) {
                        return !!dp.parentNode
                    } : function(dv, dt, dy) {
                        var dp, dB, dw, dA, dx, ds, du = dn !== e ? "nextSibling" : "previousSibling",
                            dz = dv.parentNode,
                            dr = dm && dv.nodeName.toLowerCase(),
                            dq = !dy && !dm;
                        if (dz) {
                            if (dn) {
                                while (du) {
                                    dw = dv;
                                    while ((dw = dw[du])) {
                                        if (dm ? dw.nodeName.toLowerCase() === dr : dw.nodeType === 1) {
                                            return false
                                        }
                                    }
                                    ds = du = dh === "only" && !ds && "nextSibling"
                                }
                                return true
                            }
                            ds = [e ? dz.firstChild : dz.lastChild];
                            if (e && dq) {
                                dB = dz[c5] || (dz[c5] = {});
                                dp = dB[dh] || [];
                                dx = dp[0] === de && dp[1];
                                dA = dp[0] === de && dp[2];
                                dw = dx && dz.childNodes[dx];
                                while ((dw = ++dx && dw && dw[du] || (dA = dx = 0) || ds.pop())) {
                                    if (dw.nodeType === 1 && ++dA && dw === dv) {
                                        dB[dh] = [de, dx, dA];
                                        break
                                    }
                                }
                            } else {
                                if (dq && (dp = (dv[c5] || (dv[c5] = {}))[dh]) && dp[0] === de) {
                                    dA = dp[1]
                                } else {
                                    while ((dw = ++dx && dw && dw[du] || (dA = dx = 0) || ds.pop())) {
                                        if ((dm ? dw.nodeName.toLowerCase() === dr : dw.nodeType === 1) && ++dA) {
                                            if (dq) {
                                                (dw[c5] || (dw[c5] = {}))[dh] = [de, dA]
                                            }
                                            if (dw === dv) {
                                                break
                                            }
                                        }
                                    }
                                }
                            }
                            dA -= di;
                            return dA === dl || (dA % dl === 0 && dA / dl >= 0)
                        }
                    }
                },
                PSEUDO: function(dj, di) {
                    var e, dh = cn.pseudos[dj] || cn.setFilters[dj.toLowerCase()] || cv.error("unsupported pseudo: " + dj);
                    if (dh[c5]) {
                        return dh(di)
                    }
                    if (dh.length > 1) {
                        e = [dj, dj, "", di];
                        return cn.setFilters.hasOwnProperty(dj.toLowerCase()) ? cj(function(dm, dp) {
                            var dl, dk = dh(dm, di),
                                dn = dk.length;
                            while (dn--) {
                                dl = b9.call(dm, dk[dn]);
                                dm[dl] = !(dp[dl] = dk[dn])
                            }
                        }) : function(dk) {
                            return dh(dk, 0, e)
                        }
                    }
                    return dh
                }
            },
            pseudos: {
                not: cj(function(e) {
                    var dh = [],
                        di = [],
                        dj = cS(e.replace(cr, "$1"));
                    return dj[c5] ? cj(function(dl, dr, dp, dm) {
                        var dq, dk = dj(dl, null, dm, []),
                            dn = dl.length;
                        while (dn--) {
                            if ((dq = dk[dn])) {
                                dl[dn] = !(dr[dn] = dq)
                            }
                        }
                    }) : function(dm, dl, dk) {
                        dh[0] = dm;
                        dj(dh, null, dk, di);
                        return !di.pop()
                    }
                }),
                has: cj(function(e) {
                    return function(dh) {
                        return cv(e, dh).length > 0
                    }
                }),
                contains: cj(function(e) {
                    return function(dh) {
                        return (dh.textContent || dh.innerText || cH(dh)).indexOf(e) > -1
                    }
                }),
                lang: cj(function(e) {
                    if (!cQ.test(e || "")) {
                        cv.error("unsupported lang: " + e)
                    }
                    e = e.replace(cs, c1).toLowerCase();
                    return function(di) {
                        var dh;
                        do {
                            if ((dh = cd ? di.getAttribute("xml:lang") || di.getAttribute("lang") : di.lang)) {
                                dh = dh.toLowerCase();
                                return dh === e || dh.indexOf(e + "-") === 0
                            }
                        } while ((di = di.parentNode) && di.nodeType === 1);
                        return false
                    }
                }),
                target: function(e) {
                    var dh = da.location && da.location.hash;
                    return dh && dh.slice(1) === e.id
                },
                root: function(e) {
                    return e === co
                },
                focus: function(e) {
                    return e === cB.activeElement && (!cB.hasFocus || cB.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
                },
                enabled: function(e) {
                    return e.disabled === false
                },
                disabled: function(e) {
                    return e.disabled === true
                },
                checked: function(e) {
                    var dh = e.nodeName.toLowerCase();
                    return (dh === "input" && !!e.checked) || (dh === "option" && !!e.selected)
                },
                selected: function(e) {
                    if (e.parentNode) {
                        e.parentNode.selectedIndex
                    }
                    return e.selected === true
                },
                empty: function(e) {
                    for (e = e.firstChild; e; e = e.nextSibling) {
                        if (e.nodeName > "@" || e.nodeType === 3 || e.nodeType === 4) {
                            return false
                        }
                    }
                    return true
                },
                parent: function(e) {
                    return !cn.pseudos.empty(e)
                },
                header: function(e) {
                    return cl.test(e.nodeName)
                },
                input: function(e) {
                    return b8.test(e.nodeName)
                },
                button: function(dh) {
                    var e = dh.nodeName.toLowerCase();
                    return e === "input" && dh.type === "button" || e === "button"
                },
                text: function(dh) {
                    var e;
                    return dh.nodeName.toLowerCase() === "input" && dh.type === "text" && ((e = dh.getAttribute("type")) == null || e.toLowerCase() === dh.type)
                },
                first: c3(function() {
                    return [0]
                }),
                last: c3(function(e, dh) {
                    return [dh - 1]
                }),
                eq: c3(function(e, di, dh) {
                    return [dh < 0 ? dh + di : dh]
                }),
                even: c3(function(e, di) {
                    var dh = 0;
                    for (; dh < di; dh += 2) {
                        e.push(dh)
                    }
                    return e
                }),
                odd: c3(function(e, di) {
                    var dh = 1;
                    for (; dh < di; dh += 2) {
                        e.push(dh)
                    }
                    return e
                }),
                lt: c3(function(e, dj, di) {
                    var dh = di < 0 ? di + dj : di;
                    for (; --dh >= 0;) {
                        e.push(dh)
                    }
                    return e
                }),
                gt: c3(function(e, dj, di) {
                    var dh = di < 0 ? di + dj : di;
                    for (; ++dh < dj;) {
                        e.push(dh)
                    }
                    return e
                })
            }
        };
        for (cx in {
                radio: true,
                checkbox: true,
                file: true,
                password: true,
                image: true
            }) {
            cn.pseudos[cx] = cw(cx)
        }
        for (cx in {
                submit: true,
                reset: true
            }) {
            cn.pseudos[cx] = b7(cx)
        }

        function cf(dk, dq) {
            var dh, dl, dn, dp, dm, di, e, dj = c4[dk + " "];
            if (dj) {
                return dq ? 0 : dj.slice(0)
            }
            dm = dk;
            di = [];
            e = cn.preFilter;
            while (dm) {
                if (!dh || (dl = cu.exec(dm))) {
                    if (dl) {
                        dm = dm.slice(dl[0].length) || dm
                    }
                    di.push(dn = [])
                }
                dh = false;
                if ((dl = cA.exec(dm))) {
                    dh = dl.shift();
                    dn.push({
                        value: dh,
                        type: dl[0].replace(cr, " ")
                    });
                    dm = dm.slice(dh.length)
                }
                for (dp in cn.filter) {
                    if ((dl = cY[dp].exec(dm)) && (!e[dp] || (dl = e[dp](dl)))) {
                        dh = dl.shift();
                        dn.push({
                            value: dh,
                            type: dp,
                            matches: dl
                        });
                        dm = dm.slice(dh.length)
                    }
                }
                if (!dh) {
                    break
                }
            }
            return dq ? dm.length : dm ? cv.error(dk) : c4(dk, di).slice(0)
        }

        function cg(dj) {
            var di = 0,
                dh = dj.length,
                e = "";
            for (; di < dh; di++) {
                e += dj[di].value
            }
            return e
        }

        function cq(dk, di, dj) {
            var e = di.dir,
                dl = dj && e === "parentNode",
                dh = c0++;
            return di.first ? function(dp, dn, dm) {
                while ((dp = dp[e])) {
                    if (dp.nodeType === 1 || dl) {
                        return dk(dp, dn, dm)
                    }
                }
            } : function(dr, dp, dn) {
                var dt, dm, dq, ds = de + " " + dh;
                if (dn) {
                    while ((dr = dr[e])) {
                        if (dr.nodeType === 1 || dl) {
                            if (dk(dr, dp, dn)) {
                                return true
                            }
                        }
                    }
                } else {
                    while ((dr = dr[e])) {
                        if (dr.nodeType === 1 || dl) {
                            dq = dr[c5] || (dr[c5] = {});
                            if ((dm = dq[e]) && dm[0] === ds) {
                                if ((dt = dm[1]) === true || dt === cb) {
                                    return dt === true
                                }
                            } else {
                                dm = dq[e] = [ds];
                                dm[1] = dk(dr, dp, dn) || cb;
                                if (dm[1] === true) {
                                    return true
                                }
                            }
                        }
                    }
                }
            }
        }

        function df(e) {
            return e.length > 1 ? function(dk, dj, dh) {
                var di = e.length;
                while (di--) {
                    if (!e[di](dk, dj, dh)) {
                        return false
                    }
                }
                return true
            } : e[0]
        }

        function cX(e, dh, di, dj, dm) {
            var dk, dq = [],
                dl = 0,
                dn = e.length,
                dp = dh != null;
            for (; dl < dn; dl++) {
                if ((dk = e[dl])) {
                    if (!di || di(dk, dj, dm)) {
                        dq.push(dk);
                        if (dp) {
                            dh.push(dl)
                        }
                    }
                }
            }
            return dq
        }

        function ce(di, dh, dk, dj, dl, e) {
            if (dj && !dj[c5]) {
                dj = ce(dj)
            }
            if (dl && !dl[c5]) {
                dl = ce(dl, e)
            }
            return cj(function(dx, du, dp, dw) {
                var dz, dv, dr, dq = [],
                    dy = [],
                    dn = du.length,
                    dm = dx || cy(dh || "*", dp.nodeType ? [dp] : dp, []),
                    ds = di && (dx || !dh) ? cX(dm, dq, di, dp, dw) : dm,
                    dt = dk ? dl || (dx ? di : dn || dj) ? [] : du : ds;
                if (dk) {
                    dk(ds, dt, dp, dw)
                }
                if (dj) {
                    dz = cX(dt, dy);
                    dj(dz, [], dp, dw);
                    dv = dz.length;
                    while (dv--) {
                        if ((dr = dz[dv])) {
                            dt[dy[dv]] = !(ds[dy[dv]] = dr)
                        }
                    }
                }
                if (dx) {
                    if (dl || di) {
                        if (dl) {
                            dz = [];
                            dv = dt.length;
                            while (dv--) {
                                if ((dr = dt[dv])) {
                                    dz.push((ds[dv] = dr))
                                }
                            }
                            dl(null, (dt = []), dz, dw)
                        }
                        dv = dt.length;
                        while (dv--) {
                            if ((dr = dt[dv]) && (dz = dl ? b9.call(dx, dr) : dq[dv]) > -1) {
                                dx[dz] = !(du[dz] = dr)
                            }
                        }
                    }
                } else {
                    dt = cX(dt === du ? dt.splice(dn, dt.length) : dt);
                    if (dl) {
                        dl(null, du, dt, dw)
                    } else {
                        b4.apply(du, dt)
                    }
                }
            })
        }

        function c6(dm) {
            var dh, dk, di, dl = dm.length,
                dq = cn.relative[dm[0].type],
                dr = dq || cn.relative[" "],
                dj = dq ? 1 : 0,
                dn = cq(function(ds) {
                    return ds === dh
                }, dr, true),
                dp = cq(function(ds) {
                    return b9.call(dh, ds) > -1
                }, dr, true),
                e = [function(du, dt, ds) {
                    return (!dq && (ds || dt !== dg)) || ((dh = dt).nodeType ? dn(du, dt, ds) : dp(du, dt, ds))
                }];
            for (; dj < dl; dj++) {
                if ((dk = cn.relative[dm[dj].type])) {
                    e = [cq(df(e), dk)]
                } else {
                    dk = cn.filter[dm[dj].type].apply(null, dm[dj].matches);
                    if (dk[c5]) {
                        di = ++dj;
                        for (; di < dl; di++) {
                            if (cn.relative[dm[di].type]) {
                                break
                            }
                        }
                        return ce(dj > 1 && df(e), dj > 1 && cg(dm.slice(0, dj - 1)).replace(cr, "$1"), dk, dj < di && c6(dm.slice(dj, di)), di < dl && c6((dm = dm.slice(di))), di < dl && cg(dm))
                    }
                    e.push(dk)
                }
            }
            return df(e)
        }

        function cU(dj, di) {
            var dl = 0,
                e = di.length > 0,
                dk = dj.length > 0,
                dh = function(dw, dq, dv, du, dC) {
                    var dr, ds, dx, dB = [],
                        dA = 0,
                        dt = "0",
                        dm = dw && [],
                        dy = dC != null,
                        dz = dg,
                        dp = dw || dk && cn.find.TAG("*", dC && dq.parentNode || dq),
                        dn = (de += dz == null ? 1 : Math.random() || 0.1);
                    if (dy) {
                        dg = dq !== cB && dq;
                        cb = dl
                    }
                    for (;
                        (dr = dp[dt]) != null; dt++) {
                        if (dk && dr) {
                            ds = 0;
                            while ((dx = dj[ds++])) {
                                if (dx(dr, dq, dv)) {
                                    du.push(dr);
                                    break
                                }
                            }
                            if (dy) {
                                de = dn;
                                cb = ++dl
                            }
                        }
                        if (e) {
                            if ((dr = !dx && dr)) {
                                dA--
                            }
                            if (dw) {
                                dm.push(dr)
                            }
                        }
                    }
                    dA += dt;
                    if (e && dt !== dA) {
                        ds = 0;
                        while ((dx = di[ds++])) {
                            dx(dm, dB, dq, dv)
                        }
                        if (dw) {
                            if (dA > 0) {
                                while (dt--) {
                                    if (!(dm[dt] || dB[dt])) {
                                        dB[dt] = c8.call(du)
                                    }
                                }
                            }
                            dB = cX(dB)
                        }
                        b4.apply(du, dB);
                        if (dy && !dw && dB.length > 0 && (dA + di.length) > 1) {
                            cv.uniqueSort(du)
                        }
                    }
                    if (dy) {
                        de = dn;
                        dg = dz
                    }
                    return dm
                };
            return e ? cj(dh) : dh
        }
        cS = cv.compile = function(e, dl) {
            var di, dh = [],
                dk = [],
                dj = cG[e + " "];
            if (!dj) {
                if (!dl) {
                    dl = cf(e)
                }
                di = dl.length;
                while (di--) {
                    dj = c6(dl[di]);
                    if (dj[c5]) {
                        dh.push(dj)
                    } else {
                        dk.push(dj)
                    }
                }
                dj = cG(e, cU(dk, dh))
            }
            return dj
        };

        function cy(dh, dk, dj) {
            var di = 0,
                e = dk.length;
            for (; di < e; di++) {
                cv(dh, dk[di], dj)
            }
            return dj
        }

        function dc(di, e, dj, dm) {
            var dk, dp, dh, dq, dn, dl = cf(di);
            if (!dm) {
                if (dl.length === 1) {
                    dp = dl[0] = dl[0].slice(0);
                    if (dp.length > 2 && (dh = dp[0]).type === "ID" && e.nodeType === 9 && !cd && cn.relative[dp[1].type]) {
                        e = cn.find.ID(dh.matches[0].replace(cs, c1), e)[0];
                        if (!e) {
                            return dj
                        }
                        di = di.slice(dp.shift().value.length)
                    }
                    dk = cY.needsContext.test(di) ? 0 : dp.length;
                    while (dk--) {
                        dh = dp[dk];
                        if (cn.relative[(dq = dh.type)]) {
                            break
                        }
                        if ((dn = cn.find[dq])) {
                            if ((dm = dn(dh.matches[0].replace(cs, c1), cW.test(dp[0].type) && e.parentNode || e))) {
                                dp.splice(dk, 1);
                                di = dm.length && cg(dp);
                                if (!di) {
                                    b4.apply(dj, cm.call(dm, 0));
                                    return dj
                                }
                                break
                            }
                        }
                    }
                }
            }
            cS(di, dl)(dm, e, cd, dj, cW.test(di));
            return dj
        }
        cn.pseudos.nth = cn.pseudos.eq;

        function cR() {}
        cn.filters = cR.prototype = cn.pseudos;
        cn.setFilters = new cR();
        cV();
        cv.attr = bJ.attr;
        bJ.find = cv;
        bJ.expr = cv.selectors;
        bJ.expr[":"] = bJ.expr.pseudos;
        bJ.unique = cv.uniqueSort;
        bJ.text = cv.getText;
        bJ.isXMLDoc = cv.isXML;
        bJ.contains = cv.contains
    })(a2);
    var aj = /Until$/,
        bt = /^(?:parents|prev(?:Until|All))/,
        an = /^.[^:#\[\.,]*$/,
        y = bJ.expr.match.needsContext,
        bx = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };
    bJ.fn.extend({
        find: function(b3) {
            var b6, b5, b4, e = this.length;
            if (typeof b3 !== "string") {
                b4 = this;
                return this.pushStack(bJ(b3).filter(function() {
                    for (b6 = 0; b6 < e; b6++) {
                        if (bJ.contains(b4[b6], this)) {
                            return true
                        }
                    }
                }))
            }
            b5 = [];
            for (b6 = 0; b6 < e; b6++) {
                bJ.find(b3, this[b6], b5)
            }
            b5 = this.pushStack(e > 1 ? bJ.unique(b5) : b5);
            b5.selector = (this.selector ? this.selector + " " : "") + b3;
            return b5
        },
        has: function(b5) {
            var b4, b3 = bJ(b5, this),
                e = b3.length;
            return this.filter(function() {
                for (b4 = 0; b4 < e; b4++) {
                    if (bJ.contains(this, b3[b4])) {
                        return true
                    }
                }
            })
        },
        not: function(e) {
            return this.pushStack(aO(this, e, false))
        },
        filter: function(e) {
            return this.pushStack(aO(this, e, true))
        },
        is: function(e) {
            return !!e && (typeof e === "string" ? y.test(e) ? bJ(e, this.context).index(this[0]) >= 0 : bJ.filter(e, this).length > 0 : this.filter(e).length > 0)
        },
        closest: function(b6, b5) {
            var b7, b4 = 0,
                e = this.length,
                b3 = [],
                b8 = y.test(b6) || typeof b6 !== "string" ? bJ(b6, b5 || this.context) : 0;
            for (; b4 < e; b4++) {
                b7 = this[b4];
                while (b7 && b7.ownerDocument && b7 !== b5 && b7.nodeType !== 11) {
                    if (b8 ? b8.index(b7) > -1 : bJ.find.matchesSelector(b7, b6)) {
                        b3.push(b7);
                        break
                    }
                    b7 = b7.parentNode
                }
            }
            return this.pushStack(b3.length > 1 ? bJ.unique(b3) : b3)
        },
        index: function(e) {
            if (!e) {
                return (this[0] && this[0].parentNode) ? this.first().prevAll().length : -1
            }
            if (typeof e === "string") {
                return bJ.inArray(this[0], bJ(e))
            }
            return bJ.inArray(e.jquery ? e[0] : e, this)
        },
        add: function(e, b3) {
            var b5 = typeof e === "string" ? bJ(e, b3) : bJ.makeArray(e && e.nodeType ? [e] : e),
                b4 = bJ.merge(this.get(), b5);
            return this.pushStack(bJ.unique(b4))
        },
        addBack: function(e) {
            return this.add(e == null ? this.prevObject : this.prevObject.filter(e))
        }
    });
    bJ.fn.andSelf = bJ.fn.addBack;

    function aX(b3, e) {
        do {
            b3 = b3[e]
        } while (b3 && b3.nodeType !== 1);
        return b3
    }
    bJ.each({
        parent: function(b3) {
            var e = b3.parentNode;
            return e && e.nodeType !== 11 ? e : null
        },
        parents: function(e) {
            return bJ.dir(e, "parentNode")
        },
        parentsUntil: function(b3, e, b4) {
            return bJ.dir(b3, "parentNode", b4)
        },
        next: function(e) {
            return aX(e, "nextSibling")
        },
        prev: function(e) {
            return aX(e, "previousSibling")
        },
        nextAll: function(e) {
            return bJ.dir(e, "nextSibling")
        },
        prevAll: function(e) {
            return bJ.dir(e, "previousSibling")
        },
        nextUntil: function(b3, e, b4) {
            return bJ.dir(b3, "nextSibling", b4)
        },
        prevUntil: function(b3, e, b4) {
            return bJ.dir(b3, "previousSibling", b4)
        },
        siblings: function(e) {
            return bJ.sibling((e.parentNode || {}).firstChild, e)
        },
        children: function(e) {
            return bJ.sibling(e.firstChild)
        },
        contents: function(e) {
            return bJ.nodeName(e, "iframe") ? e.contentDocument || e.contentWindow.document : bJ.merge([], e.childNodes)
        }
    }, function(e, b3) {
        bJ.fn[e] = function(b6, b4) {
            var b5 = bJ.map(this, b3, b6);
            if (!aj.test(e)) {
                b4 = b6
            }
            if (b4 && typeof b4 === "string") {
                b5 = bJ.filter(b4, b5)
            }
            b5 = this.length > 1 && !bx[e] ? bJ.unique(b5) : b5;
            if (this.length > 1 && bt.test(e)) {
                b5 = b5.reverse()
            }
            return this.pushStack(b5)
        }
    });
    bJ.extend({
        filter: function(b4, e, b3) {
            if (b3) {
                b4 = ":not(" + b4 + ")"
            }
            return e.length === 1 ? bJ.find.matchesSelector(e[0], b4) ? [e[0]] : [] : bJ.find.matches(b4, e)
        },
        dir: function(b4, b3, b6) {
            var e = [],
                b5 = b4[b3];
            while (b5 && b5.nodeType !== 9 && (b6 === aG || b5.nodeType !== 1 || !bJ(b5).is(b6))) {
                if (b5.nodeType === 1) {
                    e.push(b5)
                }
                b5 = b5[b3]
            }
            return e
        },
        sibling: function(b4, b3) {
            var e = [];
            for (; b4; b4 = b4.nextSibling) {
                if (b4.nodeType === 1 && b4 !== b3) {
                    e.push(b4)
                }
            }
            return e
        }
    });

    function aO(b5, b4, e) {
        b4 = b4 || 0;
        if (bJ.isFunction(b4)) {
            return bJ.grep(b5, function(b7, b6) {
                var b8 = !!b4.call(b7, b6, b7);
                return b8 === e
            })
        } else {
            if (b4.nodeType) {
                return bJ.grep(b5, function(b6) {
                    return (b6 === b4) === e
                })
            } else {
                if (typeof b4 === "string") {
                    var b3 = bJ.grep(b5, function(b6) {
                        return b6.nodeType === 1
                    });
                    if (an.test(b4)) {
                        return bJ.filter(b4, b3, !e)
                    } else {
                        b4 = bJ.filter(b4, b3)
                    }
                }
            }
        }
        return bJ.grep(b5, function(b6) {
            return (bJ.inArray(b6, b4) >= 0) === e
        })
    }

    function A(e) {
        var b4 = d.split("|"),
            b3 = e.createDocumentFragment();
        if (b3.createElement) {
            while (b4.length) {
                b3.createElement(b4.pop())
            }
        }
        return b3
    }
    var d = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
        aA = / jQuery\d+="(?:null|\d+)"/g,
        J = new RegExp("<(?:" + d + ")[\\s/>]", "i"),
        b2 = /^\s+/,
        aD = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        m = /<([\w:]+)/,
        bX = /<tbody/i,
        I = /<|&#?\w+;/,
        al = /<(?:script|style|link)/i,
        q = /^(?:checkbox|radio)$/i,
        bU = /checked\s*(?:[^=]|=\s*.checked.)/i,
        bz = /^$|\/(?:java|ecma)script/i,
        ar = /^true\/(.*)/,
        aK = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
        T = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            area: [1, "<map>", "</map>"],
            param: [1, "<object>", "</object>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            _default: bJ.support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
        },
        aS = A(l),
        j = aS.appendChild(l.createElement("div"));
    T.optgroup = T.option;
    T.tbody = T.tfoot = T.colgroup = T.caption = T.thead;
    T.th = T.td;
    bJ.fn.extend({
        text: function(e) {
            return bJ.access(this, function(b3) {
                return b3 === aG ? bJ.text(this) : this.empty().append((this[0] && this[0].ownerDocument || l).createTextNode(b3))
            }, null, e, arguments.length)
        },
        wrapAll: function(e) {
            if (bJ.isFunction(e)) {
                return this.each(function(b4) {
                    bJ(this).wrapAll(e.call(this, b4))
                })
            }
            if (this[0]) {
                var b3 = bJ(e, this[0].ownerDocument).eq(0).clone(true);
                if (this[0].parentNode) {
                    b3.insertBefore(this[0])
                }
                b3.map(function() {
                    var b4 = this;
                    while (b4.firstChild && b4.firstChild.nodeType === 1) {
                        b4 = b4.firstChild
                    }
                    return b4
                }).append(this)
            }
            return this
        },
        wrapInner: function(e) {
            if (bJ.isFunction(e)) {
                return this.each(function(b3) {
                    bJ(this).wrapInner(e.call(this, b3))
                })
            }
            return this.each(function() {
                var b3 = bJ(this),
                    b4 = b3.contents();
                if (b4.length) {
                    b4.wrapAll(e)
                } else {
                    b3.append(e)
                }
            })
        },
        wrap: function(e) {
            var b3 = bJ.isFunction(e);
            return this.each(function(b4) {
                bJ(this).wrapAll(b3 ? e.call(this, b4) : e)
            })
        },
        unwrap: function() {
            return this.parent().each(function() {
                if (!bJ.nodeName(this, "body")) {
                    bJ(this).replaceWith(this.childNodes)
                }
            }).end()
        },
        append: function() {
            return this.domManip(arguments, true, function(e) {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                    this.appendChild(e)
                }
            })
        },
        prepend: function() {
            return this.domManip(arguments, true, function(e) {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                    this.insertBefore(e, this.firstChild)
                }
            })
        },
        before: function() {
            return this.domManip(arguments, false, function(e) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(e, this)
                }
            })
        },
        after: function() {
            return this.domManip(arguments, false, function(e) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(e, this.nextSibling)
                }
            })
        },
        remove: function(e, b6) {
            var b5, b3 = 0;
            for (;
                (b5 = this[b3]) != null; b3++) {
                if (!e || bJ.filter(e, [b5]).length > 0) {
                    if (!b6 && b5.nodeType === 1) {
                        bJ.cleanData(k(b5))
                    }
                    if (b5.parentNode) {
                        if (b6 && bJ.contains(b5.ownerDocument, b5)) {
                            bs(k(b5, "script"))
                        }
                        var b4 = b5.parentNode.removeChild(b5)
                    }
                }
            }
            return this
        },
        empty: function() {
            var b4, e = 0;
            for (;
                (b4 = this[e]) != null; e++) {
                if (b4.nodeType === 1) {
                    bJ.cleanData(k(b4, false))
                }
                while (b4.firstChild) {
                    var b3 = b4.removeChild(b4.firstChild)
                }
                if (b4.options && bJ.nodeName(b4, "select")) {
                    b4.options.length = 0
                }
            }
            return this
        },
        clone: function(b3, e) {
            b3 = b3 == null ? false : b3;
            e = e == null ? b3 : e;
            return this.map(function() {
                return bJ.clone(this, b3, e)
            })
        },
        html: function(e) {
            return bJ.access(this, function(b6) {
                var b5 = this[0] || {},
                    b4 = 0,
                    b3 = this.length;
                if (b6 === aG) {
                    return b5.nodeType === 1 ? b5.innerHTML.replace(aA, "") : aG
                }
                if (typeof b6 === "string" && !al.test(b6) && (bJ.support.htmlSerialize || !J.test(b6)) && (bJ.support.leadingWhitespace || !b2.test(b6)) && !T[(m.exec(b6) || ["", ""])[1].toLowerCase()]) {
                    b6 = b6.replace(aD, "<$1></$2>");
                    try {
                        for (; b4 < b3; b4++) {
                            b5 = this[b4] || {};
                            if (b5.nodeType === 1) {
                                bJ.cleanData(k(b5, false));
                                TVA.putInnerHTML(b5, b6)
                            }
                        }
                        b5 = 0
                    } catch (b7) {}
                }
                if (b5) {
                    this.empty().append(b6)
                }
            }, null, e, arguments.length)
        },
        replaceWith: function(b3) {
            var e = bJ.isFunction(b3);
            if (!e && typeof b3 !== "string") {
                b3 = bJ(b3).not(this).detach()
            }
            return this.domManip([b3], true, function(b6) {
                var b5 = this.nextSibling,
                    b4 = this.parentNode;
                if (b4) {
                    bJ(this).remove();
                    b4.insertBefore(b6, b5)
                }
            })
        },
        detach: function(e) {
            return this.remove(e, true)
        },
        domManip: function(ca, cg, cf) {
            ca = aI.apply([], ca);
            var b8, b4, e, b6, cd, b9, b7 = 0,
                b5 = this.length,
                cc = this,
                ce = b5 - 1,
                cb = ca[0],
                b3 = bJ.isFunction(cb);
            if (b3 || !(b5 <= 1 || typeof cb !== "string" || bJ.support.checkClone || !bU.test(cb))) {
                return this.each(function(ci) {
                    var ch = cc.eq(ci);
                    if (b3) {
                        ca[0] = cb.call(this, ci, cg ? ch.html() : aG)
                    }
                    ch.domManip(ca, cg, cf)
                })
            }
            if (b5) {
                b9 = bJ.buildFragment(ca, this[0].ownerDocument, false, this);
                b8 = b9.firstChild;
                if (b9.childNodes.length === 1) {
                    b9 = b8
                }
                if (b8) {
                    cg = cg && bJ.nodeName(b8, "tr");
                    b6 = bJ.map(k(b9, "script"), t);
                    e = b6.length;
                    for (; b7 < b5; b7++) {
                        b4 = b9;
                        if (b7 !== ce) {
                            b4 = bJ.clone(b4, true, true);
                            if (e) {
                                bJ.merge(b6, k(b4, "script"))
                            }
                        }
                        cf.call(cg && bJ.nodeName(this[b7], "table") ? x(this[b7], "tbody") : this[b7], b4, b7)
                    }
                    if (e) {
                        cd = b6[b6.length - 1].ownerDocument;
                        bJ.map(b6, bc);
                        for (b7 = 0; b7 < e; b7++) {
                            b4 = b6[b7];
                            if (bz.test(b4.type || "") && !bJ._data(b4, "globalEval") && bJ.contains(cd, b4)) {
                                if (b4.src) {
                                    bJ.ajax({
                                        url: b4.src,
                                        type: "GET",
                                        dataType: "script",
                                        async: false,
                                        global: false,
                                        "throws": true
                                    })
                                } else {
                                    bJ.globalEval((b4.text || b4.textContent || b4.innerHTML || "").replace(aK, ""))
                                }
                            }
                        }
                    }
                    b9 = b8 = null
                }
            }
            return this
        }
    });

    function x(b3, e) {
        return b3.getElementsByTagName(e)[0] || b3.appendChild(b3.ownerDocument.createElement(e))
    }

    function t(b3) {
        var e = b3.getAttributeNode("type");
        b3.type = (e && e.specified) + "/" + b3.type;
        return b3
    }

    function bc(b3) {
        var e = ar.exec(b3.type);
        if (e) {
            b3.type = e[1]
        } else {
            b3.removeAttribute("type")
        }
        return b3
    }

    function bs(e, b4) {
        var b5, b3 = 0;
        for (;
            (b5 = e[b3]) != null; b3++) {
            bJ._data(b5, "globalEval", !b4 || bJ._data(b4[b3], "globalEval"))
        }
    }

    function at(b9, b3) {
        if (b3.nodeType !== 1 || !bJ.hasData(b9)) {
            return
        }
        var b6, b5, e, b8 = bJ._data(b9),
            b7 = bJ._data(b3, b8),
            b4 = b8.events;
        if (b4) {
            delete b7.handle;
            b7.events = {};
            for (b6 in b4) {
                for (b5 = 0, e = b4[b6].length; b5 < e; b5++) {
                    bJ.event.add(b3, b6, b4[b6][b5])
                }
            }
        }
        if (b7.data) {
            b7.data = bJ.extend({}, b7.data)
        }
    }

    function Q(b6, b3) {
        var b7, b5, b4;
        if (b3.nodeType !== 1) {
            return
        }
        b7 = b3.nodeName.toLowerCase();
        if (!bJ.support.noCloneEvent && b3[bJ.expando]) {
            b4 = bJ._data(b3);
            for (b5 in b4.events) {
                bJ.removeEvent(b3, b5, b4.handle)
            }
            b3.removeAttribute(bJ.expando)
        }
        if (b7 === "script" && b3.text !== b6.text) {
            t(b3).text = b6.text;
            bc(b3)
        } else {
            if (b7 === "object") {
                if (b3.parentNode) {
                    b3.outerHTML = b6.outerHTML
                }
                if (bJ.support.html5Clone && (b6.innerHTML && !bJ.trim(b3.innerHTML))) {
                    TVA.putInnerHTML(b3, b6.innerHTML)
                }
            } else {
                if (b7 === "input" && q.test(b6.type)) {
                    b3.defaultChecked = b3.checked = b6.checked;
                    if (b3.value !== b6.value) {
                        b3.value = b6.value
                    }
                } else {
                    if (b7 === "option") {
                        b3.defaultSelected = b3.selected = b6.defaultSelected
                    } else {
                        if (b7 === "input" || b7 === "textarea") {
                            b3.defaultValue = b6.defaultValue
                        }
                    }
                }
            }
        }
    }
    bJ.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(e, b3) {
        bJ.fn[e] = function(b4) {
            var b5, b7 = 0,
                b6 = [],
                b9 = bJ(b4),
                b8 = b9.length - 1;
            for (; b7 <= b8; b7++) {
                b5 = b7 === b8 ? this : this.clone(true);
                bJ(b9[b7])[b3](b5);
                ao.apply(b6, b5.get())
            }
            return this.pushStack(b6)
        }
    });

    function k(b5, e) {
        var b3, b6, b4 = 0,
            b7 = typeof b5.getElementsByTagName !== aC ? b5.getElementsByTagName(e || "*") : typeof b5.querySelectorAll !== aC ? b5.querySelectorAll(e || "*") : aG;
        if (!b7) {
            for (b7 = [], b3 = b5.childNodes || b5;
                (b6 = b3[b4]) != null; b4++) {
                if (!e || bJ.nodeName(b6, e)) {
                    b7.push(b6)
                } else {
                    bJ.merge(b7, k(b6, e))
                }
            }
        }
        return e === aG || e && bJ.nodeName(b5, e) ? bJ.merge([b5], b7) : b7
    }

    function bV(e) {
        if (q.test(e.type)) {
            e.defaultChecked = e.checked
        }
    }
    bJ.extend({
        clone: function(b4, b6, e) {
            var b8, b5, cb, b7, b9, ca = bJ.contains(b4.ownerDocument, b4);
            if (bJ.support.html5Clone || bJ.isXMLDoc(b4) || !J.test("<" + b4.nodeName + ">")) {
                cb = b4.cloneNode(true)
            } else {
                TVA.putInnerHTML(j, b4.outerHTML);
                var b3 = j.removeChild(cb = j.firstChild)
            }
            if ((!bJ.support.noCloneEvent || !bJ.support.noCloneChecked) && (b4.nodeType === 1 || b4.nodeType === 11) && !bJ.isXMLDoc(b4)) {
                b8 = k(cb);
                b9 = k(b4);
                for (b7 = 0;
                    (b5 = b9[b7]) != null; ++b7) {
                    if (b8[b7]) {
                        Q(b5, b8[b7])
                    }
                }
            }
            if (b6) {
                if (e) {
                    b9 = b9 || k(b4);
                    b8 = b8 || k(cb);
                    for (b7 = 0;
                        (b5 = b9[b7]) != null; b7++) {
                        at(b5, b8[b7])
                    }
                } else {
                    at(b4, cb)
                }
            }
            b8 = k(cb, "script");
            if (b8.length > 0) {
                bs(b8, !ca && k(b4, "script"))
            }
            b8 = b9 = b5 = null;
            return cb
        },
        buildFragment: function(b3, b5, cb, cg) {
            var cc, b8, ca, cf, ch, ce, b4, b9 = b3.length,
                b7 = A(b5),
                e = [],
                cd = 0;
            for (; cd < b9; cd++) {
                b8 = b3[cd];
                if (b8 || b8 === 0) {
                    if (bJ.type(b8) === "object") {
                        bJ.merge(e, b8.nodeType ? [b8] : b8)
                    } else {
                        if (!I.test(b8)) {
                            e.push(b5.createTextNode(b8))
                        } else {
                            cf = cf || b7.appendChild(b5.createElement("div"));
                            ch = (m.exec(b8) || ["", ""])[1].toLowerCase();
                            b4 = T[ch] || T._default;
                            TVA.putInnerHTML(cf, b4[1] + b8.replace(aD, "<$1></$2>") + b4[2]);
                            cc = b4[0];
                            while (cc--) {
                                cf = cf.lastChild
                            }
                            if (!bJ.support.leadingWhitespace && b2.test(b8)) {
                                e.push(b5.createTextNode(b2.exec(b8)[0]))
                            }
                            if (!bJ.support.tbody) {
                                b8 = ch === "table" && !bX.test(b8) ? cf.firstChild : b4[1] === "<table>" && !bX.test(b8) ? cf : 0;
                                cc = b8 && b8.childNodes.length;
                                while (cc--) {
                                    if (bJ.nodeName((ce = b8.childNodes[cc]), "tbody") && !ce.childNodes.length) {
                                        var b6 = b8.removeChild(ce)
                                    }
                                }
                            }
                            bJ.merge(e, cf.childNodes);
                            cf.textContent = "";
                            while (cf.firstChild) {
                                var b6 = cf.removeChild(cf.firstChild)
                            }
                            cf = b7.lastChild
                        }
                    }
                }
            }
            if (cf) {
                var b6 = b7.removeChild(cf)
            }
            if (!bJ.support.appendChecked) {
                bJ.grep(k(e, "input"), bV)
            }
            cd = 0;
            while ((b8 = e[cd++])) {
                if (cg && bJ.inArray(b8, cg) !== -1) {
                    continue
                }
                ca = bJ.contains(b8.ownerDocument, b8);
                cf = k(b7.appendChild(b8), "script");
                if (ca) {
                    bs(cf)
                }
                if (cb) {
                    cc = 0;
                    while ((b8 = cf[cc++])) {
                        if (bz.test(b8.type || "")) {
                            cb.push(b8)
                        }
                    }
                }
            }
            cf = null;
            return b7
        },
        cleanData: function(b3, cb) {
            var b5, ca, b4, b6, b7 = 0,
                cc = bJ.expando,
                e = bJ.cache,
                b8 = bJ.support.deleteExpando,
                b9 = bJ.event.special;
            for (;
                (b5 = b3[b7]) != null; b7++) {
                if (cb || bJ.acceptData(b5)) {
                    b4 = b5[cc];
                    b6 = b4 && e[b4];
                    if (b6) {
                        if (b6.events) {
                            for (ca in b6.events) {
                                if (b9[ca]) {
                                    bJ.event.remove(b5, ca)
                                } else {
                                    bJ.removeEvent(b5, ca, b6.handle)
                                }
                            }
                        }
                        if (e[b4]) {
                            delete e[b4];
                            if (b8) {
                                delete b5[cc]
                            } else {
                                if (typeof b5.removeAttribute !== aC) {
                                    b5.removeAttribute(cc)
                                } else {
                                    b5[cc] = null
                                }
                            }
                            a6.push(b4)
                        }
                    }
                }
            }
        }
    });
    var aE, bo, E, bg = /alpha\([^)]*\)/i,
        aT = /opacity\s*=\s*([^)]*)/,
        bn = /^(top|right|bottom|left)$/,
        F = /^(none|table(?!-c[ea]).+)/,
        aY = /^margin/,
        a9 = new RegExp("^(" + bA + ")(.*)$", "i"),
        W = new RegExp("^(" + bA + ")(?!px)[a-z%]+$", "i"),
        S = new RegExp("^([+-])=(" + bA + ")", "i"),
        bj = {
            BODY: "block"
        },
        bb = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        bC = {
            letterSpacing: 0,
            fontWeight: 400
        },
        bT = ["Top", "Right", "Bottom", "Left"],
        av = ["Webkit", "O", "Moz", "ms"];

    function b(b5, b3) {
        if (b3 in b5) {
            return b3
        }
        var b6 = b3.charAt(0).toUpperCase() + b3.slice(1),
            e = b3,
            b4 = av.length;
        while (b4--) {
            b3 = av[b4] + b6;
            if (b3 in b5) {
                return b3
            }
        }
        return e
    }

    function P(b3, e) {
        b3 = e || b3;
        return bJ.css(b3, "display") === "none" || !bJ.contains(b3.ownerDocument, b3)
    }

    function p(b8, e) {
        var b9, b6, b7, b3 = [],
            b4 = 0,
            b5 = b8.length;
        for (; b4 < b5; b4++) {
            b6 = b8[b4];
            if (!b6.style) {
                continue
            }
            b3[b4] = bJ._data(b6, "olddisplay");
            b9 = b6.style.display;
            if (e) {
                if (!b3[b4] && b9 === "none") {
                    b6.style.display = ""
                }
                if (b6.style.display === "" && P(b6)) {
                    b3[b4] = bJ._data(b6, "olddisplay", bE(b6.nodeName))
                }
            } else {
                if (!b3[b4]) {
                    b7 = P(b6);
                    if (b9 && b9 !== "none" || !b7) {
                        bJ._data(b6, "olddisplay", b7 ? b9 : bJ.css(b6, "display"))
                    }
                }
            }
        }
        for (b4 = 0; b4 < b5; b4++) {
            b6 = b8[b4];
            if (!b6.style) {
                continue
            }
            if (!e || b6.style.display === "none" || b6.style.display === "") {
                b6.style.display = e ? b3[b4] || "" : "none"
            }
        }
        return b8
    }
    bJ.fn.extend({
        css: function(e, b3) {
            return bJ.access(this, function(b8, b5, b9) {
                var b4, b7, ca = {},
                    b6 = 0;
                if (bJ.isArray(b5)) {
                    b7 = bo(b8);
                    b4 = b5.length;
                    for (; b6 < b4; b6++) {
                        ca[b5[b6]] = bJ.css(b8, b5[b6], false, b7)
                    }
                    return ca
                }
                return b9 !== aG ? bJ.style(b8, b5, b9) : bJ.css(b8, b5)
            }, e, b3, arguments.length > 1)
        },
        show: function() {
            return p(this, true)
        },
        hide: function() {
            return p(this)
        },
        toggle: function(b3) {
            var e = typeof b3 === "boolean";
            return this.each(function() {
                if (e ? b3 : P(this)) {
                    bJ(this).show()
                } else {
                    bJ(this).hide()
                }
            })
        }
    });
    bJ.extend({
        cssHooks: {
            opacity: {
                get: function(b4, b3) {
                    if (b3) {
                        var e = E(b4, "opacity");
                        return e === "" ? "1" : e
                    }
                }
            }
        },
        cssNumber: {
            columnCount: true,
            fillOpacity: true,
            fontWeight: true,
            lineHeight: true,
            opacity: true,
            orphans: true,
            widows: true,
            zIndex: true,
            zoom: true
        },
        cssProps: {
            "float": bJ.support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(b5, b4, cb, b6) {
            if (!b5 || b5.nodeType === 3 || b5.nodeType === 8 || !b5.style) {
                return
            }
            var b9, ca, cc, b7 = bJ.camelCase(b4),
                b3 = b5.style;
            b4 = bJ.cssProps[b7] || (bJ.cssProps[b7] = b(b3, b7));
            cc = bJ.cssHooks[b4] || bJ.cssHooks[b7];
            if (cb !== aG) {
                ca = typeof cb;
                if (ca === "string" && (b9 = S.exec(cb))) {
                    cb = (b9[1] + 1) * b9[2] + parseFloat(bJ.css(b5, b4));
                    ca = "number"
                }
                if (cb == null || ca === "number" && isNaN(cb)) {
                    return
                }
                if (ca === "number" && !bJ.cssNumber[b7]) {
                    cb += "px"
                }
                if (!bJ.support.clearCloneStyle && cb === "" && b4.indexOf("background") === 0) {
                    b3[b4] = "inherit"
                }
                if (!cc || !("set" in cc) || (cb = cc.set(b5, cb, b6)) !== aG) {
                    try {
                        b3[b4] = cb
                    } catch (b8) {}
                }
            } else {
                if (cc && "get" in cc && (b9 = cc.get(b5, false, b6)) !== aG) {
                    return b9
                }
                return b3[b4]
            }
        },
        css: function(b8, b6, b3, b7) {
            var b5, b9, e, b4 = bJ.camelCase(b6);
            b6 = bJ.cssProps[b4] || (bJ.cssProps[b4] = b(b8.style, b4));
            e = bJ.cssHooks[b6] || bJ.cssHooks[b4];
            if (e && "get" in e) {
                b9 = e.get(b8, true, b3)
            }
            if (b9 === aG) {
                b9 = E(b8, b6, b7)
            }
            if (b9 === "normal" && b6 in bC) {
                b9 = bC[b6]
            }
            if (b3 === "" || b3) {
                b5 = parseFloat(b9);
                return b3 === true || bJ.isNumeric(b5) ? b5 || 0 : b9
            }
            return b9
        },
        swap: function(b7, b6, b8, b5) {
            var b4, b3, e = {};
            for (b3 in b6) {
                e[b3] = b7.style[b3];
                b7.style[b3] = b6[b3]
            }
            b4 = b8.apply(b7, b5 || []);
            for (b3 in b6) {
                b7.style[b3] = e[b3]
            }
            return b4
        }
    });
    if (a2.getComputedStyle) {
        bo = function(e) {
            return a2.getComputedStyle(e, null)
        };
        E = function(b6, b4, b8) {
            var b5, b3, ca, b7 = b8 || bo(b6),
                b9 = b7 ? b7.getPropertyValue(b4) || b7[b4] : aG,
                e = b6.style;
            if (b7) {
                if (b9 === "" && !bJ.contains(b6.ownerDocument, b6)) {
                    b9 = bJ.style(b6, b4)
                }
                if (W.test(b9) && aY.test(b4)) {
                    b5 = e.width;
                    b3 = e.minWidth;
                    ca = e.maxWidth;
                    e.minWidth = e.maxWidth = e.width = b9;
                    b9 = b7.width;
                    e.width = b5;
                    e.minWidth = b3;
                    e.maxWidth = ca
                }
            }
            return b9
        }
    } else {
        if (l.documentElement.currentStyle) {
            bo = function(e) {
                return e.currentStyle
            };
            E = function(b5, b3, b8) {
                var b4, b7, b9, b6 = b8 || bo(b5),
                    ca = b6 ? b6[b3] : aG,
                    e = b5.style;
                if (ca == null && e && e[b3]) {
                    ca = e[b3]
                }
                if (W.test(ca) && !bn.test(b3)) {
                    b4 = e.left;
                    b7 = b5.runtimeStyle;
                    b9 = b7 && b7.left;
                    if (b9) {
                        b7.left = b5.currentStyle.left
                    }
                    e.left = b3 === "fontSize" ? "1em" : ca;
                    ca = e.pixelLeft + "px";
                    e.left = b4;
                    if (b9) {
                        b7.left = b9
                    }
                }
                return ca === "" ? "auto" : ca
            }
        }
    }

    function aJ(e, b4, b5) {
        var b3 = a9.exec(b4);
        return b3 ? Math.max(0, b3[1] - (b5 || 0)) + (b3[2] || "px") : b4
    }

    function aw(b6, b3, e, b8, b5) {
        var b4 = e === (b8 ? "border" : "content") ? 4 : b3 === "width" ? 1 : 0,
            b7 = 0;
        for (; b4 < 4; b4 += 2) {
            if (e === "margin") {
                b7 += bJ.css(b6, e + bT[b4], true, b5)
            }
            if (b8) {
                if (e === "content") {
                    b7 -= bJ.css(b6, "padding" + bT[b4], true, b5)
                }
                if (e !== "margin") {
                    b7 -= bJ.css(b6, "border" + bT[b4] + "Width", true, b5)
                }
            } else {
                b7 += bJ.css(b6, "padding" + bT[b4], true, b5);
                if (e !== "padding") {
                    b7 += bJ.css(b6, "border" + bT[b4] + "Width", true, b5)
                }
            }
        }
        return b7
    }

    function u(b6, b3, e) {
        var b5 = true,
            b7 = b3 === "width" ? b6.offsetWidth : b6.offsetHeight,
            b4 = bo(b6),
            b8 = bJ.support.boxSizing && bJ.css(b6, "boxSizing", false, b4) === "border-box";
        if (b7 <= 0 || b7 == null) {
            b7 = E(b6, b3, b4);
            if (b7 < 0 || b7 == null) {
                b7 = b6.style[b3]
            }
            if (W.test(b7)) {
                return b7
            }
            b5 = b8 && (bJ.support.boxSizingReliable || b7 === b6.style[b3]);
            b7 = parseFloat(b7) || 0
        }
        return (b7 + aw(b6, b3, e || (b8 ? "border" : "content"), b5, b4)) + "px"
    }

    function bE(b4) {
        var b3 = l,
            e = bj[b4];
        if (!e) {
            e = a1(b4, b3);
            if (e === "none" || !e) {
                aE = (aE || bJ("<iframe frameborder='0' width='0' height='0'/>").css("cssText", "display:block !important")).appendTo(b3.documentElement);
                b3 = (aE[0].contentWindow || aE[0].contentDocument).document;
                b3.write("<!doctype html><html><body>");
                b3.close();
                e = a1(b4, b3);
                aE.detach()
            }
            bj[b4] = e
        }
        return e
    }

    function a1(e, b5) {
        var b3 = bJ(b5.createElement(e)).appendTo(b5.body),
            b4 = bJ.css(b3[0], "display");
        b3.remove();
        return b4
    }
    bJ.each(["height", "width"], function(b3, e) {
        bJ.cssHooks[e] = {
            get: function(b6, b5, b4) {
                if (b5) {
                    return b6.offsetWidth === 0 && F.test(bJ.css(b6, "display")) ? bJ.swap(b6, bb, function() {
                        return u(b6, e, b4)
                    }) : u(b6, e, b4)
                }
            },
            set: function(b6, b7, b4) {
                var b5 = b4 && bo(b6);
                return aJ(b6, b7, b4 ? aw(b6, e, b4, bJ.support.boxSizing && bJ.css(b6, "boxSizing", false, b5) === "border-box", b5) : 0)
            }
        }
    });
    if (!bJ.support.opacity) {
        bJ.cssHooks.opacity = {
            get: function(b3, e) {
                return aT.test((e && b3.currentStyle ? b3.currentStyle.filter : b3.style.filter) || "") ? (0.01 * parseFloat(RegExp.$1)) + "" : e ? "1" : ""
            },
            set: function(b6, b7) {
                var b5 = b6.style,
                    b3 = b6.currentStyle,
                    e = bJ.isNumeric(b7) ? "alpha(opacity=" + b7 * 100 + ")" : "",
                    b4 = b3 && b3.filter || b5.filter || "";
                b5.zoom = 1;
                if ((b7 >= 1 || b7 === "") && bJ.trim(b4.replace(bg, "")) === "" && b5.removeAttribute) {
                    b5.removeAttribute("filter");
                    if (b7 === "" || b3 && !b3.filter) {
                        return
                    }
                }
                b5.filter = bg.test(b4) ? b4.replace(bg, e) : b4 + " " + e
            }
        }
    }
    bJ(function() {
        if (!bJ.support.reliableMarginRight) {
            bJ.cssHooks.marginRight = {
                get: function(b3, e) {
                    if (e) {
                        return bJ.swap(b3, {
                            display: "inline-block"
                        }, E, [b3, "marginRight"])
                    }
                }
            }
        }
        if (!bJ.support.pixelPosition && bJ.fn.position) {
            bJ.each(["top", "left"], function(e, b3) {
                bJ.cssHooks[b3] = {
                    get: function(b5, b4) {
                        if (b4) {
                            b4 = E(b5, b3);
                            return W.test(b4) ? bJ(b5).position()[b3] + "px" : b4
                        }
                    }
                }
            })
        }
    });
    if (bJ.expr && bJ.expr.filters) {
        bJ.expr.filters.hidden = function(e) {
            return e.offsetWidth <= 0 && e.offsetHeight <= 0 || (!bJ.support.reliableHiddenOffsets && ((e.style && e.style.display) || bJ.css(e, "display")) === "none")
        };
        bJ.expr.filters.visible = function(e) {
            return !bJ.expr.filters.hidden(e)
        }
    }
    bJ.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(e, b3) {
        bJ.cssHooks[e + b3] = {
            expand: function(b6) {
                var b5 = 0,
                    b4 = {},
                    b7 = typeof b6 === "string" ? b6.split(" ") : [b6];
                for (; b5 < 4; b5++) {
                    b4[e + bT[b5] + b3] = b7[b5] || b7[b5 - 2] || b7[0]
                }
                return b4
            }
        };
        if (!aY.test(e)) {
            bJ.cssHooks[e + b3].set = aJ
        }
    });
    var bv = /%20/g,
        aR = /\[\]$/,
        U = /\r?\n/g,
        c = /^(?:submit|button|image|reset|file)$/i,
        au = /^(?:input|select|textarea|keygen)/i;
    bJ.fn.extend({
        serialize: function() {
            return bJ.param(this.serializeArray())
        },
        serializeArray: function() {
            return this.map(function() {
                var e = bJ.prop(this, "elements");
                return e ? bJ.makeArray(e) : this
            }).filter(function() {
                var e = this.type;
                return this.name && !bJ(this).is(":disabled") && au.test(this.nodeName) && !c.test(e) && (this.checked || !q.test(e))
            }).map(function(e, b3) {
                var b4 = bJ(this).val();
                return b4 == null ? null : bJ.isArray(b4) ? bJ.map(b4, function(b5) {
                    return {
                        name: b3.name,
                        value: b5.replace(U, "\r\n")
                    }
                }) : {
                    name: b3.name,
                    value: b4.replace(U, "\r\n")
                }
            }).get()
        }
    });
    bJ.param = function(e, b4) {
        var b5, b3 = [],
            b6 = function(b7, b8) {
                b8 = bJ.isFunction(b8) ? b8() : (b8 == null ? "" : b8);
                b3[b3.length] = encodeURIComponent(b7) + "=" + encodeURIComponent(b8)
            };
        if (b4 === aG) {
            b4 = bJ.ajaxSettings && bJ.ajaxSettings.traditional
        }
        if (bJ.isArray(e) || (e.jquery && !bJ.isPlainObject(e))) {
            bJ.each(e, function() {
                b6(this.name, this.value)
            })
        } else {
            for (b5 in e) {
                i(b5, e[b5], b4, b6)
            }
        }
        return b3.join("&").replace(bv, "+")
    };

    function i(b4, b6, b3, b5) {
        var e;
        if (bJ.isArray(b6)) {
            bJ.each(b6, function(b8, b7) {
                if (b3 || aR.test(b4)) {
                    b5(b4, b7)
                } else {
                    i(b4 + "[" + (typeof b7 === "object" ? b8 : "") + "]", b7, b3, b5)
                }
            })
        } else {
            if (!b3 && bJ.type(b6) === "object") {
                for (e in b6) {
                    i(b4 + "[" + e + "]", b6[e], b3, b5)
                }
            } else {
                b5(b4, b6)
            }
        }
    }
    bJ.each(("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu").split(" "), function(b3, e) {
        bJ.fn[e] = function(b5, b4) {
            return arguments.length > 0 ? this.on(e, null, b5, b4) : this.trigger(e)
        }
    });
    bJ.fn.hover = function(e, b3) {
        return this.mouseenter(e).mouseleave(b3 || e)
    };
    var b1, Y, bO = bJ.now(),
        az = /\?/,
        ap = /#.*$/,
        O = /([?&])_=[^&]*/,
        ag = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
        B = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        o = /^(?:GET|HEAD)$/,
        aH = /^\/\//,
        aU = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
        b0 = bJ.fn.load,
        v = {},
        a7 = {},
        aW = "*/".concat("*");
    try {
        Y = aL.href
    } catch (bf) {
        Y = l.createElement("a");
        Y.href = "";
        Y = Y.href
    }
    b1 = aU.exec(Y.toLowerCase()) || [];

    function bL(e) {
        return function(b6, b7) {
            if (typeof b6 !== "string") {
                b7 = b6;
                b6 = "*"
            }
            var b3, b4 = 0,
                b5 = b6.toLowerCase().match(ac) || [];
            if (bJ.isFunction(b7)) {
                while ((b3 = b5[b4++])) {
                    if (b3[0] === "+") {
                        b3 = b3.slice(1) || "*";
                        (e[b3] = e[b3] || []).unshift(b7)
                    } else {
                        (e[b3] = e[b3] || []).push(b7)
                    }
                }
            }
        }
    }

    function n(e, b4, b8, b5) {
        var b3 = {},
            b6 = (e === a7);

        function b7(b9) {
            var ca;
            b3[b9] = true;
            bJ.each(e[b9] || [], function(cc, cb) {
                var cd = cb(b4, b8, b5);
                if (typeof cd === "string" && !b6 && !b3[cd]) {
                    b4.dataTypes.unshift(cd);
                    b7(cd);
                    return false
                } else {
                    if (b6) {
                        return !(ca = cd)
                    }
                }
            });
            return ca
        }
        return b7(b4.dataTypes[0]) || !b3["*"] && b7("*")
    }

    function r(b4, b5) {
        var e, b3, b6 = bJ.ajaxSettings.flatOptions || {};
        for (b3 in b5) {
            if (b5[b3] !== aG) {
                (b6[b3] ? b4 : (e || (e = {})))[b3] = b5[b3]
            }
        }
        if (e) {
            bJ.extend(true, b4, e)
        }
        return b4
    }
    bJ.fn.load = function(b5, b8, b9) {
        if (typeof b5 !== "string" && b0) {
            return b0.apply(this, arguments)
        }
        var e, b4, b6, b3 = this,
            b7 = b5.indexOf(" ");
        if (b7 >= 0) {
            e = b5.slice(b7, b5.length);
            b5 = b5.slice(0, b7)
        }
        if (bJ.isFunction(b8)) {
            b9 = b8;
            b8 = aG
        } else {
            if (b8 && typeof b8 === "object") {
                b6 = "POST"
            }
        }
        if (b3.length > 0) {
            bJ.ajax({
                url: b5,
                type: b6,
                dataType: "html",
                data: b8
            }).done(function(ca) {
                b4 = arguments;
                b3.html(e ? bJ("<div>").append(bJ.parseHTML(ca)).find(e) : ca)
            }).complete(b9 && function(cb, ca) {
                b3.each(b9, b4 || [cb.responseText, ca, cb])
            })
        }
        return this
    };
    bJ.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(e, b3) {
        bJ.fn[b3] = function(b4) {
            return this.on(b3, b4)
        }
    });
    bJ.each(["get", "post"], function(e, b3) {
        bJ[b3] = function(b4, b6, b7, b5) {
            if (bJ.isFunction(b6)) {
                b5 = b5 || b7;
                b7 = b6;
                b6 = aG
            }
            return bJ.ajax({
                url: b4,
                type: b3,
                dataType: b5,
                data: b6,
                success: b7
            })
        }
    });
    bJ.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: Y,
            type: "GET",
            isLocal: B.test(b1[1]),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": aW,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },
            converters: {
                "* text": a2.String,
                "text html": true,
                "text json": bJ.parseJSON,
                "text xml": bJ.parseXML
            },
            flatOptions: {
                url: true,
                context: true
            }
        },
        ajaxSetup: function(b3, e) {
            return e ? r(r(b3, bJ.ajaxSettings), e) : r(bJ.ajaxSettings, b3)
        },
        ajaxPrefilter: bL(v),
        ajaxTransport: bL(a7),
        ajax: function(b7, b4) {
            if (typeof b7 === "object") {
                b4 = b7;
                b7 = aG
            }
            b4 = b4 || {};
            var cg, ci, b8, cn, cc, b3, cj, b5, cb = bJ.ajaxSetup({}, b4),
                cp = cb.context || cb,
                ce = cb.context && (cp.nodeType || cp.jquery) ? bJ(cp) : bJ.event,
                co = bJ.Deferred(),
                cl = bJ.Callbacks("once memory"),
                b9 = cb.statusCode || {},
                cf = {},
                cm = {},
                b6 = 0,
                ca = "canceled",
                ch = {
                    readyState: 0,
                    getResponseHeader: function(cq) {
                        var e;
                        if (b6 === 2) {
                            if (!b5) {
                                b5 = {};
                                while ((e = ag.exec(cn))) {
                                    b5[e[1].toLowerCase()] = e[2]
                                }
                            }
                            e = b5[cq.toLowerCase()]
                        }
                        return e == null ? null : e
                    },
                    getAllResponseHeaders: function() {
                        return b6 === 2 ? cn : null
                    },
                    setRequestHeader: function(cq, cr) {
                        var e = cq.toLowerCase();
                        if (!b6) {
                            cq = cm[e] = cm[e] || cq;
                            cf[cq] = cr
                        }
                        return this
                    },
                    overrideMimeType: function(e) {
                        if (!b6) {
                            cb.mimeType = e
                        }
                        return this
                    },
                    statusCode: function(cq) {
                        var e;
                        if (cq) {
                            if (b6 < 2) {
                                for (e in cq) {
                                    b9[e] = [b9[e], cq[e]]
                                }
                            } else {
                                ch.always(cq[ch.status])
                            }
                        }
                        return this
                    },
                    abort: function(cq) {
                        var e = cq || ca;
                        if (cj) {
                            cj.abort(e)
                        }
                        cd(0, e);
                        return this
                    }
                };
            co.promise(ch).complete = cl.add;
            ch.success = ch.done;
            ch.error = ch.fail;
            cb.url = ((b7 || cb.url || Y) + "").replace(ap, "").replace(aH, b1[1] + "//");
            cb.type = b4.method || b4.type || cb.method || cb.type;
            cb.dataTypes = bJ.trim(cb.dataType || "*").toLowerCase().match(ac) || [""];
            if (cb.crossDomain == null) {
                cg = aU.exec(cb.url.toLowerCase());
                cb.crossDomain = !!(cg && (cg[1] !== b1[1] || cg[2] !== b1[2] || (cg[3] || (cg[1] === "http:" ? 80 : 443)) != (b1[3] || (b1[1] === "http:" ? 80 : 443))))
            }
            if (cb.data && cb.processData && typeof cb.data !== "string") {
                cb.data = bJ.param(cb.data, cb.traditional)
            }
            n(v, cb, b4, ch);
            if (b6 === 2) {
                return ch
            }
            b3 = cb.global;
            if (b3 && bJ.active++ === 0) {
                bJ.event.trigger("ajaxStart")
            }
            cb.type = cb.type.toUpperCase();
            cb.hasContent = !o.test(cb.type);
            b8 = cb.url;
            if (!cb.hasContent) {
                if (cb.data) {
                    b8 = (cb.url += (az.test(b8) ? "&" : "?") + cb.data);
                    delete cb.data
                }
                if (cb.cache === false) {
                    cb.url = O.test(b8) ? b8.replace(O, "$1_=" + bO++) : b8 + (az.test(b8) ? "&" : "?") + "_=" + bO++
                }
            }
            if (cb.ifModified) {
                if (bJ.lastModified[b8]) {
                    ch.setRequestHeader("If-Modified-Since", bJ.lastModified[b8])
                }
                if (bJ.etag[b8]) {
                    ch.setRequestHeader("If-None-Match", bJ.etag[b8])
                }
            }
            if (cb.data && cb.hasContent && cb.contentType !== false || b4.contentType) {
                ch.setRequestHeader("Content-Type", cb.contentType)
            }
            ch.setRequestHeader("Accept", cb.dataTypes[0] && cb.accepts[cb.dataTypes[0]] ? cb.accepts[cb.dataTypes[0]] + (cb.dataTypes[0] !== "*" ? ", " + aW + "; q=0.01" : "") : cb.accepts["*"]);
            for (ci in cb.headers) {
                ch.setRequestHeader(ci, cb.headers[ci])
            }
            if (cb.beforeSend && (cb.beforeSend.call(cp, ch, cb) === false || b6 === 2)) {
                return ch.abort()
            }
            ca = "abort";
            for (ci in {
                    success: 1,
                    error: 1,
                    complete: 1
                }) {
                ch[ci](cb[ci])
            }
            cj = n(a7, cb, b4, ch);
            if (!cj) {
                cd(-1, "No Transport")
            } else {
                ch.readyState = 1;
                if (b3) {
                    ce.trigger("ajaxSend", [ch, cb])
                }
                if (cb.async && cb.timeout > 0) {
                    cc = setTimeout(function() {
                        ch.abort("timeout")
                    }, cb.timeout)
                }
                try {
                    b6 = 1;
                    cj.send(cf, cd)
                } catch (ck) {
                    if (b6 < 2) {
                        cd(-1, ck)
                    } else {
                        throw ck
                    }
                }
            }

            function cd(cu, cq, cv, cs) {
                var e, cy, cw, ct, cx, cr = cq;
                if (b6 === 2) {
                    return
                }
                b6 = 2;
                if (cc) {
                    clearTimeout(cc)
                }
                cj = aG;
                cn = cs || "";
                ch.readyState = cu > 0 ? 4 : 0;
                if (cv) {
                    ct = g(cb, ch, cv)
                }
                if (cu >= 200 && cu < 300 || cu === 304) {
                    if (cb.ifModified) {
                        cx = ch.getResponseHeader("Last-Modified");
                        if (cx) {
                            bJ.lastModified[b8] = cx
                        }
                        cx = ch.getResponseHeader("etag");
                        if (cx) {
                            bJ.etag[b8] = cx
                        }
                    }
                    if (cu === 204) {
                        e = true;
                        cr = "nocontent"
                    } else {
                        if (cu === 304) {
                            e = true;
                            cr = "notmodified"
                        } else {
                            e = af(cb, ct);
                            cr = e.state;
                            cy = e.data;
                            cw = e.error;
                            e = !cw
                        }
                    }
                } else {
                    cw = cr;
                    if (cu || !cr) {
                        cr = "error";
                        if (cu < 0) {
                            cu = 0
                        }
                    }
                }
                ch.status = cu;
                ch.statusText = (cq || cr) + "";
                if (e) {
                    co.resolveWith(cp, [cy, cr, ch])
                } else {
                    co.rejectWith(cp, [ch, cr, cw])
                }
                ch.statusCode(b9);
                b9 = aG;
                if (b3) {
                    ce.trigger(e ? "ajaxSuccess" : "ajaxError", [ch, cb, e ? cy : cw])
                }
                cl.fireWith(cp, [ch, cr]);
                if (b3) {
                    ce.trigger("ajaxComplete", [ch, cb]);
                    if (!(--bJ.active)) {
                        bJ.event.trigger("ajaxStop")
                    }
                }
            }
            return ch
        },
        getScript: function(e, b3) {
            return bJ.get(e, aG, b3, "script")
        },
        getJSON: function(e, b3, b4) {
            return bJ.get(e, b3, b4, "json")
        }
    });

    function g(cb, ca, b7) {
        var e, b6, b5, b8, b3 = cb.contents,
            b9 = cb.dataTypes,
            b4 = cb.responseFields;
        for (b8 in b4) {
            if (b8 in b7) {
                ca[b4[b8]] = b7[b8]
            }
        }
        while (b9[0] === "*") {
            b9.shift();
            if (b6 === aG) {
                b6 = cb.mimeType || ca.getResponseHeader("Content-Type")
            }
        }
        if (b6) {
            for (b8 in b3) {
                if (b3[b8] && b3[b8].test(b6)) {
                    b9.unshift(b8);
                    break
                }
            }
        }
        if (b9[0] in b7) {
            b5 = b9[0]
        } else {
            for (b8 in b7) {
                if (!b9[0] || cb.converters[b8 + " " + b9[0]]) {
                    b5 = b8;
                    break
                }
                if (!e) {
                    e = b8
                }
            }
            b5 = b5 || e
        }
        if (b5) {
            if (b5 !== b9[0]) {
                b9.unshift(b5)
            }
            return b7[b5]
        }
    }

    function af(cd, b5) {
        var b3, b9, cb, b6, cc = {},
            b7 = 0,
            ca = cd.dataTypes.slice(),
            b4 = ca[0];
        if (cd.dataFilter) {
            b5 = cd.dataFilter(b5, cd.dataType)
        }
        if (ca[1]) {
            for (cb in cd.converters) {
                cc[cb.toLowerCase()] = cd.converters[cb]
            }
        }
        for (;
            (b9 = ca[++b7]);) {
            if (b9 !== "*") {
                if (b4 !== "*" && b4 !== b9) {
                    cb = cc[b4 + " " + b9] || cc["* " + b9];
                    if (!cb) {
                        for (b3 in cc) {
                            b6 = b3.split(" ");
                            if (b6[1] === b9) {
                                cb = cc[b4 + " " + b6[0]] || cc["* " + b6[0]];
                                if (cb) {
                                    if (cb === true) {
                                        cb = cc[b3]
                                    } else {
                                        if (cc[b3] !== true) {
                                            b9 = b6[0];
                                            ca.splice(b7--, 0, b9)
                                        }
                                    }
                                    break
                                }
                            }
                        }
                    }
                    if (cb !== true) {
                        if (cb && cd["throws"]) {
                            b5 = cb(b5)
                        } else {
                            try {
                                b5 = cb(b5)
                            } catch (b8) {
                                return {
                                    state: "parsererror",
                                    error: cb ? b8 : "No conversion from " + b4 + " to " + b9
                                }
                            }
                        }
                    }
                }
                b4 = b9
            }
        }
        return {
            state: "success",
            data: b5
        }
    }
    bJ.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function(e) {
                bJ.globalEval(e);
                return e
            }
        }
    });
    bJ.ajaxPrefilter("script", function(e) {
        if (e.cache === aG) {
            e.cache = false
        }
        if (e.crossDomain) {
            e.type = "GET";
            e.global = false
        }
    });
    bJ.ajaxTransport("script", function(b4) {
        if (b4.crossDomain) {
            var e, b3 = l.head || bJ("head")[0] || l.documentElement;
            return {
                send: function(b5, b6) {
                    e = l.createElement("script");
                    e.async = true;
                    if (b4.scriptCharset) {
                        e.charset = b4.scriptCharset
                    }
                    e.src = b4.url;
                    e.onerror = function(b7) {
                        b6(400, "error")
                    };
                    e.onload = e.onreadystatechange = function(b8, b7) {
                        if (b7 || !e.readyState || /loaded|complete/.test(e.readyState)) {
                            e.onload = e.onreadystatechange = null;
                            if (e.parentNode) {
                                var b9 = e.parentNode.removeChild(e)
                            }
                            e = null;
                            if (!b7) {
                                b6(200, "success")
                            }
                        }
                    };
                    b3.insertBefore(e, b3.firstChild)
                },
                abort: function() {
                    if (e) {
                        e.onload(aG, true)
                    }
                }
            }
        }
    });
    var bq = [],
        a5 = /(=)\?(?=&|$)|\?\?/;
    bJ.ajaxSetup({
        jsonp: "cb",
        jsonpCallback: function() {
            var e = bq.pop() || (bJ.expando + "_" + (bO++));
            this[e] = true;
            return e
        }
    });
    bJ.ajaxPrefilter("json jsonp", function(b5, e, b6) {
        var b8, b3, b4, b7 = b5.jsonp !== false && (a5.test(b5.url) ? "url" : typeof b5.data === "string" && !(b5.contentType || "").indexOf("application/x-www-form-urlencoded") && a5.test(b5.data) && "data");
        if (b7 || b5.dataTypes[0] === "jsonp") {
            b8 = b5.jsonpCallback = bJ.isFunction(b5.jsonpCallback) ? b5.jsonpCallback() : b5.jsonpCallback;
            if (b7) {
                b5[b7] = b5[b7].replace(a5, "$1" + b8)
            } else {
                if (b5.jsonp !== false) {
                    b5.url += (az.test(b5.url) ? "&" : "?") + b5.jsonp + "=" + b8
                }
            }
            b5.converters["script json"] = function() {
                if (!b4) {
                    bJ.error(b8 + " was not called")
                }
                return b4[0]
            };
            b5.dataTypes[0] = "json";
            b3 = a2[b8];
            a2[b8] = function() {
                b4 = arguments
            };
            b6.always(function() {
                a2[b8] = b3;
                if (b5[b8]) {
                    b5.jsonpCallback = e.jsonpCallback;
                    bq.push(b8)
                }
                if (b4 && bJ.isFunction(b3)) {
                    b3(b4[0])
                }
                b4 = b3 = aG
            });
            return "script"
        }
    });
    var ah, ax, ay = 0,
        aP = a2.ActiveXObject && function() {
            var e;
            for (e in ah) {
                ah[e](aG, true)
            }
        };

    function bD() {
        try {
            return new a2.XMLHttpRequest()
        } catch (b3) {}
    }

    function bd() {
        try {
            return new a2.ActiveXObject("Microsoft.XMLHTTP")
        } catch (b3) {}
    }
    bJ.ajaxSettings.xhr = a2.ActiveXObject ? function() {
        return !this.isLocal && bD() || bd()
    } : bD;
    ax = bJ.ajaxSettings.xhr();
    bJ.support.cors = !!ax && ("withCredentials" in ax);
    ax = bJ.support.ajax = !!ax;
    if (ax) {
        bJ.ajaxTransport(function(e) {
            if (!e.crossDomain || bJ.support.cors) {
                var b3;
                return {
                    send: function(b9, b4) {
                        var b7, b5, b8 = e.xhr();
                        if (e.username) {
                            b8.open(e.type, e.url, e.async, e.username, e.password)
                        } else {
                            b8.open(e.type, e.url, e.async)
                        }
                        if (e.xhrFields) {
                            for (b5 in e.xhrFields) {
                                b8[b5] = e.xhrFields[b5]
                            }
                        }
                        if (e.mimeType && b8.overrideMimeType) {
                            b8.overrideMimeType(e.mimeType)
                        }
                        if (!e.crossDomain && !b9["X-Requested-With"]) {
                            b9["X-Requested-With"] = "XMLHttpRequest"
                        }
                        try {
                            for (b5 in b9) {
                                b8.setRequestHeader(b5, b9[b5])
                            }
                        } catch (b6) {}
                        b8.send((e.hasContent && e.data) || null);
                        b3 = function(cc, cb) {
                            var ca, cd, cg, ce;
                            try {
                                if (b3 && (cb || b8.readyState === 4)) {
                                    b3 = aG;
                                    if (b7) {
                                        b8.onreadystatechange = bJ.noop;
                                        if (aP) {
                                            delete ah[b7]
                                        }
                                    }
                                    if (cb) {
                                        if (b8.readyState !== 4) {
                                            b8.abort()
                                        }
                                    } else {
                                        ce = {};
                                        ca = b8.status;
                                        cd = b8.getAllResponseHeaders();
                                        if (typeof b8.responseText === "string") {
                                            ce.text = b8.responseText
                                        }
                                        try {
                                            cg = b8.statusText
                                        } catch (cf) {
                                            cg = ""
                                        }
                                        if (!ca && e.isLocal && !e.crossDomain) {
                                            ca = ce.text ? 200 : 404
                                        } else {
                                            if (ca === 1223) {
                                                ca = 204
                                            }
                                        }
                                    }
                                }
                            } catch (ch) {
                                if (!cb) {
                                    b4(-1, ch)
                                }
                            }
                            if (ce) {
                                b4(ca, cg, ce, cd)
                            }
                        };
                        if (!e.async) {
                            b3()
                        } else {
                            if (b8.readyState === 4) {
                                setTimeout(b3)
                            } else {
                                b7 = ++ay;
                                if (aP) {
                                    if (!ah) {
                                        ah = {};
                                        bJ(a2).unload(aP)
                                    }
                                    ah[b7] = b3
                                }
                                b8.onreadystatechange = b3
                            }
                        }
                    },
                    abort: function() {
                        if (b3) {
                            b3(aG, true)
                        }
                    }
                }
            }
        })
    }
    var K, ad, bR = /^(?:toggle|show|hide)$/,
        bK = new RegExp("^(?:([+-])=|)(" + bA + ")([a-z%]*)$", "i"),
        bQ = /queueHooks$/,
        aB = [h],
        a0 = {
            "*": [function(e, b9) {
                var b5, ca, cb = this.createTween(e, b9),
                    b6 = bK.exec(b9),
                    b7 = cb.cur(),
                    b3 = +b7 || 0,
                    b4 = 1,
                    b8 = 20;
                if (b6) {
                    b5 = +b6[2];
                    ca = b6[3] || (bJ.cssNumber[e] ? "" : "px");
                    if (ca !== "px" && b3) {
                        b3 = bJ.css(cb.elem, e, true) || b5 || 1;
                        do {
                            b4 = b4 || ".5";
                            b3 = b3 / b4;
                            bJ.style(cb.elem, e, b3 + ca)
                        } while (b4 !== (b4 = cb.cur() / b7) && b4 !== 1 && --b8)
                    }
                    cb.unit = ca;
                    cb.start = b3;
                    cb.end = b6[1] ? b3 + (b6[1] + 1) * b5 : b5
                }
                return cb
            }]
        };

    function bm() {
        setTimeout(function() {
            K = aG
        });
        return (K = bJ.now())
    }

    function be(b3, e) {
        bJ.each(e, function(b8, b6) {
            var b7 = (a0[b8] || []).concat(a0["*"]),
                b4 = 0,
                b5 = b7.length;
            for (; b4 < b5; b4++) {
                if (b7[b4].call(b3, b8, b6)) {
                    return
                }
            }
        })
    }

    function f(b4, b8, cb) {
        var cc, e, b7 = 0,
            b3 = aB.length,
            ca = bJ.Deferred().always(function() {
                delete b6.elem
            }),
            b6 = function() {
                if (e) {
                    return false
                }
                var ci = K || bm(),
                    cf = Math.max(0, b5.startTime + b5.duration - ci),
                    cd = cf / b5.duration || 0,
                    ch = 1 - cd,
                    ce = 0,
                    cg = b5.tweens.length;
                for (; ce < cg; ce++) {
                    b5.tweens[ce].run(ch)
                }
                ca.notifyWith(b4, [b5, ch, cf]);
                if (ch < 1 && cg) {
                    return cf
                } else {
                    ca.resolveWith(b4, [b5]);
                    return false
                }
            },
            b5 = ca.promise({
                elem: b4,
                props: bJ.extend({}, b8),
                opts: bJ.extend(true, {
                    specialEasing: {}
                }, cb),
                originalProperties: b8,
                originalOptions: cb,
                startTime: K || bm(),
                duration: cb.duration,
                tweens: [],
                createTween: function(cf, cd) {
                    var ce = bJ.Tween(b4, b5.opts, cf, cd, b5.opts.specialEasing[cf] || b5.opts.easing);
                    b5.tweens.push(ce);
                    return ce
                },
                stop: function(ce) {
                    var cd = 0,
                        cf = ce ? b5.tweens.length : 0;
                    if (e) {
                        return this
                    }
                    e = true;
                    for (; cd < cf; cd++) {
                        b5.tweens[cd].run(1)
                    }
                    if (ce) {
                        ca.resolveWith(b4, [b5, ce])
                    } else {
                        ca.rejectWith(b4, [b5, ce])
                    }
                    return this
                }
            }),
            b9 = b5.props;
        am(b9, b5.opts.specialEasing);
        for (; b7 < b3; b7++) {
            cc = aB[b7].call(b5, b4, b9, b5.opts);
            if (cc) {
                return cc
            }
        }
        be(b5, b9);
        if (bJ.isFunction(b5.opts.start)) {
            b5.opts.start.call(b4, b5)
        }
        bJ.fx.timer(bJ.extend(b6, {
            elem: b4,
            anim: b5,
            queue: b5.opts.queue
        }));
        return b5.progress(b5.opts.progress).done(b5.opts.done, b5.opts.complete).fail(b5.opts.fail).always(b5.opts.always)
    }

    function am(b5, b7) {
        var b6, b4, b3, b8, e;
        for (b3 in b5) {
            b4 = bJ.camelCase(b3);
            b8 = b7[b4];
            b6 = b5[b3];
            if (bJ.isArray(b6)) {
                b8 = b6[1];
                b6 = b5[b3] = b6[0]
            }
            if (b3 !== b4) {
                b5[b4] = b6;
                delete b5[b3]
            }
            e = bJ.cssHooks[b4];
            if (e && "expand" in e) {
                b6 = e.expand(b6);
                delete b5[b4];
                for (b3 in b6) {
                    if (!(b3 in b5)) {
                        b5[b3] = b6[b3];
                        b7[b3] = b8
                    }
                }
            } else {
                b7[b4] = b8
            }
        }
    }
    bJ.Animation = bJ.extend(f, {
        tweener: function(b3, b6) {
            if (bJ.isFunction(b3)) {
                b6 = b3;
                b3 = ["*"]
            } else {
                b3 = b3.split(" ")
            }
            var b5, e = 0,
                b4 = b3.length;
            for (; e < b4; e++) {
                b5 = b3[e];
                a0[b5] = a0[b5] || [];
                a0[b5].unshift(b6)
            }
        },
        prefilter: function(b3, e) {
            if (e) {
                aB.unshift(b3)
            } else {
                aB.push(b3)
            }
        }
    });

    function h(b6, cc, e) {
        var b4, cb, b5, ce, ci, b8, ch, cg, cf, b7 = this,
            b3 = b6.style,
            cd = {},
            ca = [],
            b9 = b6.nodeType && P(b6);
        if (!e.queue) {
            cg = bJ._queueHooks(b6, "fx");
            if (cg.unqueued == null) {
                cg.unqueued = 0;
                cf = cg.empty.fire;
                cg.empty.fire = function() {
                    if (!cg.unqueued) {
                        cf()
                    }
                }
            }
            cg.unqueued++;
            b7.always(function() {
                b7.always(function() {
                    cg.unqueued--;
                    if (!bJ.queue(b6, "fx").length) {
                        cg.empty.fire()
                    }
                })
            })
        }
        if (b6.nodeType === 1 && ("height" in cc || "width" in cc)) {
            e.overflow = [b3.overflow, b3.overflowX, b3.overflowY];
            if (bJ.css(b6, "display") === "inline" && bJ.css(b6, "float") === "none") {
                if (!bJ.support.inlineBlockNeedsLayout || bE(b6.nodeName) === "inline") {
                    b3.display = "inline-block"
                } else {
                    b3.zoom = 1
                }
            }
        }
        if (e.overflow) {
            b3.overflow = "hidden";
            if (!bJ.support.shrinkWrapBlocks) {
                b7.always(function() {
                    b3.overflow = e.overflow[0];
                    b3.overflowX = e.overflow[1];
                    b3.overflowY = e.overflow[2]
                })
            }
        }
        for (cb in cc) {
            ce = cc[cb];
            if (bR.exec(ce)) {
                delete cc[cb];
                b8 = b8 || ce === "toggle";
                if (ce === (b9 ? "hide" : "show")) {
                    continue
                }
                ca.push(cb)
            }
        }
        b5 = ca.length;
        if (b5) {
            ci = bJ._data(b6, "fxshow") || bJ._data(b6, "fxshow", {});
            if ("hidden" in ci) {
                b9 = ci.hidden
            }
            if (b8) {
                ci.hidden = !b9
            }
            if (b9) {
                bJ(b6).show()
            } else {
                b7.done(function() {
                    bJ(b6).hide()
                })
            }
            b7.done(function() {
                var cj;
                bJ._removeData(b6, "fxshow");
                for (cj in cd) {
                    bJ.style(b6, cj, cd[cj])
                }
            });
            for (cb = 0; cb < b5; cb++) {
                b4 = ca[cb];
                ch = b7.createTween(b4, b9 ? ci[b4] : 0);
                cd[b4] = ci[b4] || bJ.style(b6, b4);
                if (!(b4 in ci)) {
                    ci[b4] = ch.start;
                    if (b9) {
                        ch.end = ch.start;
                        ch.start = b4 === "width" || b4 === "height" ? 1 : 0
                    }
                }
            }
        }
    }

    function G(b4, b3, b6, e, b5) {
        return new G.prototype.init(b4, b3, b6, e, b5)
    }
    bJ.Tween = G;
    G.prototype = {
        constructor: G,
        init: function(b5, b3, b7, e, b6, b4) {
            this.elem = b5;
            this.prop = b7;
            this.easing = b6 || "swing";
            this.options = b3;
            this.start = this.now = this.cur();
            this.end = e;
            this.unit = b4 || (bJ.cssNumber[b7] ? "" : "px")
        },
        cur: function() {
            var e = G.propHooks[this.prop];
            return e && e.get ? e.get(this) : G.propHooks._default.get(this)
        },
        run: function(b4) {
            var b3, e = G.propHooks[this.prop];
            if (this.options.duration) {
                this.pos = b3 = bJ.easing[this.easing](b4, this.options.duration * b4, 0, 1, this.options.duration)
            } else {
                this.pos = b3 = b4
            }
            this.now = (this.end - this.start) * b3 + this.start;
            if (this.options.step) {
                this.options.step.call(this.elem, this.now, this)
            }
            if (e && e.set) {
                e.set(this)
            } else {
                G.propHooks._default.set(this)
            }
            return this
        }
    };
    G.prototype.init.prototype = G.prototype;
    G.propHooks = {
        _default: {
            get: function(b3) {
                var e;
                if (b3.elem[b3.prop] != null && (!b3.elem.style || b3.elem.style[b3.prop] == null)) {
                    return b3.elem[b3.prop]
                }
                e = bJ.css(b3.elem, b3.prop, "");
                return !e || e === "auto" ? 0 : e
            },
            set: function(e) {
                if (bJ.fx.step[e.prop]) {
                    bJ.fx.step[e.prop](e)
                } else {
                    if (e.elem.style && (e.elem.style[bJ.cssProps[e.prop]] != null || bJ.cssHooks[e.prop])) {
                        bJ.style(e.elem, e.prop, e.now + e.unit)
                    } else {
                        e.elem[e.prop] = e.now
                    }
                }
            }
        }
    };
    G.propHooks.scrollTop = G.propHooks.scrollLeft = {
        set: function(e) {
            if (e.elem.nodeType && e.elem.parentNode) {
                e.elem[e.prop] = e.now
            }
        }
    };
    bJ.each(["toggle", "show", "hide"], function(b3, e) {
        var b4 = bJ.fn[e];
        bJ.fn[e] = function(b5, b7, b6) {
            return b5 == null || typeof b5 === "boolean" ? b4.apply(this, arguments) : this.animate(bI(e, true), b5, b7, b6)
        }
    });
    bJ.fn.extend({
        fadeTo: function(e, b5, b4, b3) {
            return this.filter(P).css("opacity", 0).show().end().animate({
                opacity: b5
            }, e, b4, b3)
        },
        animate: function(b8, b5, b7, b6) {
            var b4 = bJ.isEmptyObject(b8),
                e = bJ.speed(b5, b7, b6),
                b3 = function() {
                    var b9 = f(this, bJ.extend({}, b8), e);
                    b3.finish = function() {
                        b9.stop(true)
                    };
                    if (b4 || bJ._data(this, "finish")) {
                        b9.stop(true)
                    }
                };
            b3.finish = b3;
            return b4 || e.queue === false ? this.each(b3) : this.queue(e.queue, b3)
        },
        stop: function(b4, b3, e) {
            var b5 = function(b6) {
                var b7 = b6.stop;
                delete b6.stop;
                b7(e)
            };
            if (typeof b4 !== "string") {
                e = b3;
                b3 = b4;
                b4 = aG
            }
            if (b3 && b4 !== false) {
                this.queue(b4 || "fx", [])
            }
            return this.each(function() {
                var b9 = true,
                    b6 = b4 != null && b4 + "queueHooks",
                    b8 = bJ.timers,
                    b7 = bJ._data(this);
                if (b6) {
                    if (b7[b6] && b7[b6].stop) {
                        b5(b7[b6])
                    }
                } else {
                    for (b6 in b7) {
                        if (b7[b6] && b7[b6].stop && bQ.test(b6)) {
                            b5(b7[b6])
                        }
                    }
                }
                for (b6 = b8.length; b6--;) {
                    if (b8[b6].elem === this && (b4 == null || b8[b6].queue === b4)) {
                        b8[b6].anim.stop(e);
                        b9 = false;
                        b8.splice(b6, 1)
                    }
                }
                if (b9 || !e) {
                    bJ.dequeue(this, b4)
                }
            })
        },
        finish: function(e) {
            if (e !== false) {
                e = e || "fx"
            }
            return this.each(function() {
                var b5, b8 = bJ._data(this),
                    b4 = b8[e + "queue"],
                    b3 = b8[e + "queueHooks"],
                    b7 = bJ.timers,
                    b6 = b4 ? b4.length : 0;
                b8.finish = true;
                bJ.queue(this, e, []);
                if (b3 && b3.cur && b3.cur.finish) {
                    b3.cur.finish.call(this)
                }
                for (b5 = b7.length; b5--;) {
                    if (b7[b5].elem === this && b7[b5].queue === e) {
                        b7[b5].anim.stop(true);
                        b7.splice(b5, 1)
                    }
                }
                for (b5 = 0; b5 < b6; b5++) {
                    if (b4[b5] && b4[b5].finish) {
                        b4[b5].finish.call(this)
                    }
                }
                delete b8.finish
            })
        }
    });

    function bI(b4, b6) {
        var b5, e = {
                height: b4
            },
            b3 = 0;
        b6 = b6 ? 1 : 0;
        for (; b3 < 4; b3 += 2 - b6) {
            b5 = bT[b3];
            e["margin" + b5] = e["padding" + b5] = b4
        }
        if (b6) {
            e.opacity = e.width = b4
        }
        return e
    }
    bJ.each({
        slideDown: bI("show"),
        slideUp: bI("hide"),
        slideToggle: bI("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(e, b3) {
        bJ.fn[e] = function(b4, b6, b5) {
            return this.animate(b3, b4, b6, b5)
        }
    });
    bJ.speed = function(b4, b5, b3) {
        var e = b4 && typeof b4 === "object" ? bJ.extend({}, b4) : {
            complete: b3 || !b3 && b5 || bJ.isFunction(b4) && b4,
            duration: b4,
            easing: b3 && b5 || b5 && !bJ.isFunction(b5) && b5
        };
        e.duration = bJ.fx.off ? 0 : typeof e.duration === "number" ? e.duration : e.duration in bJ.fx.speeds ? bJ.fx.speeds[e.duration] : bJ.fx.speeds._default;
        if (e.queue == null || e.queue === true) {
            e.queue = "fx"
        }
        e.old = e.complete;
        e.complete = function() {
            if (bJ.isFunction(e.old)) {
                e.old.call(this)
            }
            if (e.queue) {
                bJ.dequeue(this, e.queue)
            }
        };
        return e
    };
    bJ.easing = {
        linear: function(e) {
            return e
        },
        swing: function(e) {
            return 0.5 - Math.cos(e * Math.PI) / 2
        }
    };
    bJ.timers = [];
    bJ.fx = G.prototype.init;
    bJ.fx.tick = function() {
        var b4, b3 = bJ.timers,
            e = 0;
        K = bJ.now();
        for (; e < b3.length; e++) {
            b4 = b3[e];
            if (!b4() && b3[e] === b4) {
                b3.splice(e--, 1)
            }
        }
        if (!b3.length) {
            bJ.fx.stop()
        }
        K = aG
    };
    bJ.fx.timer = function(e) {
        if (e() && bJ.timers.push(e)) {
            bJ.fx.start()
        }
    };
    bJ.fx.interval = 13;
    bJ.fx.start = function() {
        if (!ad) {
            ad = setInterval(bJ.fx.tick, bJ.fx.interval)
        }
    };
    bJ.fx.stop = function() {
        clearInterval(ad);
        ad = null
    };
    bJ.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    };
    bJ.fx.step = {};
    if (bJ.expr && bJ.expr.filters) {
        bJ.expr.filters.animated = function(e) {
            return bJ.grep(bJ.timers, function(b3) {
                return e === b3.elem
            }).length
        }
    }
    bJ.fn.offset = function(b3) {
        if (arguments.length) {
            return b3 === aG ? this : this.each(function(b8) {
                bJ.offset.setOffset(this, b3, b8)
            })
        }
        var e, b7, b5 = {
                top: 0,
                left: 0
            },
            b4 = this[0],
            b6 = b4 && b4.ownerDocument;
        if (!b6) {
            return
        }
        e = b6.documentElement;
        if (!bJ.contains(e, b4)) {
            return b5
        }
        if (typeof b4.getBoundingClientRect !== aC) {
            b5 = b4.getBoundingClientRect()
        }
        b7 = bp(b6);
        return {
            top: b5.top + (b7.pageYOffset || e.scrollTop) - (e.clientTop || 0),
            left: b5.left + (b7.pageXOffset || e.scrollLeft) - (e.clientLeft || 0)
        }
    };
    bJ.offset = {
        setOffset: function(b5, ce, b8) {
            var b9 = bJ.css(b5, "position");
            if (b9 === "static") {
                b5.style.position = "relative"
            }
            var b7 = bJ(b5),
                b3 = b7.offset(),
                e = bJ.css(b5, "top"),
                cc = bJ.css(b5, "left"),
                cd = (b9 === "absolute" || b9 === "fixed") && bJ.inArray("auto", [e, cc]) > -1,
                cb = {},
                ca = {},
                b4, b6;
            if (cd) {
                ca = b7.position();
                b4 = ca.top;
                b6 = ca.left
            } else {
                b4 = parseFloat(e) || 0;
                b6 = parseFloat(cc) || 0
            }
            if (bJ.isFunction(ce)) {
                ce = ce.call(b5, b8, b3)
            }
            if (ce.top != null) {
                cb.top = (ce.top - b3.top) + b4
            }
            if (ce.left != null) {
                cb.left = (ce.left - b3.left) + b6
            }
            if ("using" in ce) {
                ce.using.call(b5, cb)
            } else {
                b7.css(cb)
            }
        }
    };
    bJ.fn.extend({
        position: function() {
            if (!this[0]) {
                return
            }
            var b4, b5, e = {
                    top: 0,
                    left: 0
                },
                b3 = this[0];
            if (bJ.css(b3, "position") === "fixed") {
                b5 = b3.getBoundingClientRect()
            } else {
                b4 = this.offsetParent();
                b5 = this.offset();
                if (!bJ.nodeName(b4[0], "html")) {
                    e = b4.offset()
                }
                e.top += bJ.css(b4[0], "borderTopWidth", true);
                e.left += bJ.css(b4[0], "borderLeftWidth", true)
            }
            return {
                top: b5.top - e.top - bJ.css(b3, "marginTop", true),
                left: b5.left - e.left - bJ.css(b3, "marginLeft", true)
            }
        },
        offsetParent: function() {
            return this.map(function() {
                var e = this.offsetParent || l.documentElement;
                while (e && (!bJ.nodeName(e, "html") && bJ.css(e, "position") === "static")) {
                    e = e.offsetParent
                }
                return e || l.documentElement
            })
        }
    });
    bJ.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(b4, b3) {
        var e = /Y/.test(b3);
        bJ.fn[b4] = function(b5) {
            return bJ.access(this, function(b6, b9, b8) {
                var b7 = bp(b6);
                if (b8 === aG) {
                    return b7 ? (b3 in b7) ? b7[b3] : b7.document.documentElement[b9] : b6[b9]
                }
                if (b7) {
                    b7.scrollTo(!e ? b8 : bJ(b7).scrollLeft(), e ? b8 : bJ(b7).scrollTop())
                } else {
                    b6[b9] = b8
                }
            }, b4, b5, arguments.length, null)
        }
    });

    function bp(e) {
        return bJ.isWindow(e) ? e : e.nodeType === 9 ? e.defaultView || e.parentWindow : false
    }
    bJ.each({
        Height: "height",
        Width: "width"
    }, function(e, b3) {
        bJ.each({
            padding: "inner" + e,
            content: b3,
            "": "outer" + e
        }, function(b4, b5) {
            bJ.fn[b5] = function(b9, b8) {
                var b7 = arguments.length && (b4 || typeof b9 !== "boolean"),
                    b6 = b4 || (b9 === true || b8 === true ? "margin" : "border");
                return bJ.access(this, function(cb, ca, cc) {
                    var cd;
                    if (bJ.isWindow(cb)) {
                        return cb.document.documentElement["client" + e]
                    }
                    if (cb.nodeType === 9) {
                        cd = cb.documentElement;
                        return Math.max(cb.body["scroll" + e], cd["scroll" + e], cb.body["offset" + e], cd["offset" + e], cd["client" + e])
                    }
                    return cc === aG ? bJ.css(cb, ca, b6) : bJ.style(cb, ca, cc, b6)
                }, b3, b7 ? b9 : aG, b7, null)
            }
        })
    });
    a2.jQuery = a2.$ = bJ;
    if (typeof define === "function" && define.amd && define.amd.jQuery) {
        define("jquery", [], function() {
            return bJ
        })
    }
})(window);
var Subtitles = {
    DISABLED: false,
    tracksLimit: 3,
    subtitles: null,
    allSubtitles: null,
    subtitleLanguages: null,
    currentSubtitle: -1,
    showFn: null,
    getPosFn: null,
    started: false,
    loading: false,
    timeHack: 1,
    KEY: "subtitlesEnabled",
    language: "",
    enabled: null,
    loaded: function() {
        return (Subtitles.subtitles && Subtitles.subtitles.length > 0)
    },
    subtitlesAreEnabled: function() {
        if (Subtitles.enabled === null || typeof Subtitles.enabled === "undefined") {
            this.enabled = (totalChannelStorage.getItem(Subtitles.KEY) === "1")
        }
        return this.enabled
    },
    disable: function() {
        Subtitles.currentSubtitle = -1;
        totalChannelStorage.setItem(Subtitles.KEY, "0");
        this.enabled = false;
        this.pause()
    },
    enable: function() {
        totalChannelStorage.setItem(Subtitles.KEY, "1");
        this.enabled = true;
        this.start();
        return this.language
    },
    check: function(c, f, b) {
        Subtitles.subtitles = null;
        Subtitles.currentSubtitle = -1;
        Subtitles.allSubtitles = null;
        Subtitles.subtitleLanguages = null;
        Subtitles.language = "";
        this.loading = false;
        if (Subtitles.DISABLED === true) {
            return
        }
        if (c.toLowerCase().indexOf(".ism/manifest") > 0) {
            this.loading = true;
            var e = c;
            var a = f;
            var d = b;
            $.ajax({
                type: "GET",
                url: e,
                async: true,
                dataType: "text",
                success: function(u) {
                    try {
                        var r = 0;
                        u = u.replace(/[\x00-\x1F\x80-\xFF]/g, "");
                        var p = "",
                            l = "";
                        if (TVA.OTT.DEVICETYPE != TVA.OTT.DEVICETYPE_BRAVIA) {
                            for (r = 0; r < u.length; r++) {
                                l = u.charCodeAt(r);
                                if (l > 31 && l < 128) {
                                    p += u[r]
                                }
                            }
                        } else {
                            var m = 0;
                            for (r = 0; r < 50; r++) {
                                l = u.charCodeAt(r);
                                if (l <= 31 || l >= 128) {
                                    m = r
                                }
                            }
                            p = u.substr(m)
                        }
                        if (window.DOMParser) {
                            var h = new DOMParser();
                            xmlDoc = h.parseFromString(p, "text/xml")
                        } else {
                            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                            xmlDoc.async = false;
                            xmlDoc.loadXML(p)
                        }
                        var k = [];
                        var y = false;
                        var z = xmlDoc.getElementsByTagName("StreamIndex");
                        var x = "";
                        var g = "";
                        for (var q = 0; q < z.length; q++) {
                            var w = z[q].getAttribute("Type");
                            if (w === "text" && y == false) {
                                x = z[q].getAttribute("Language");
                                g = z[q].getAttribute("Name");
                                Subtitles.language = x;
                                Subtitles.load(e.replace(".ism/Manifest", ".dfxp").replace(".ism/manifest", ".dfxp"), a, d);
                                y = true
                            } else {
                                if (w === "audio") {
                                    x = z[q].getAttribute("Language");
                                    if (x && k.indexOf(x) >= 0) {} else {
                                        if (x === null) {} else {
                                            k[k.length] = x
                                        }
                                    }
                                }
                            }
                        }
                        if (TVA.OTT.DEVICETYPE == 3001) {
                            TVA_Player.setAudioInfo({
                                track: k,
                                selected: 0
                            })
                        }
                    } catch (v) {
                        Subtitles.loading = false
                    }
                },
                error: function() {
                    Subtitles.loading = false
                }
            })
        }
    },
    load: function(b, a, c) {
        if (Subtitles.DISABLED === true) {
            return
        }
        if (TVA.OTT.DEVICETYPE == 4000 || TVA.OTT.DEVICETYPE == 4001 || TVA.OTT.DEVICETYPE == 4002) {
            this.timeHack = 1.0009
        }
        this.loading = true;
        Subtitles.subtitles = null;
        Subtitles.currentSubtitle = -1;
        Subtitles.allSubtitles = null;
        Subtitles.subtitleLanguages = null;
        this.showFn = c;
        this.getPosFn = a;
        this.started = false;
        this.send("");
        if (b) {
            $.ajax({
                url: b,
                type: "GET",
                dataType: "text",
                success: function(d) {
                    try {
                        if (b.indexOf(".dfxp") > 0) {
                            Subtitles.parseDfxp(d)
                        } else {
                            Subtitles.parseSrt(d)
                        }
                        if (Subtitles.loaded() == true) {
                            Subtitles.start()
                        }
                    } catch (f) {}
                    Subtitles.loading = false;
                    if (Subtitles.loaded() == true) {
                        VideoPlayer.setFooter()
                    }
                },
                error: function(d, f, e) {
                    Subtitles.loading = false
                }
            })
        }
    },
    getpos: function() {
        try {
            if (this.getPosFn) {
                return this.getPosFn()
            }
        } catch (a) {}
        return -1
    },
    strip: function(a) {
        return a.replace(/^\s+|\s+$/g, "")
    },
    toSeconds: function(e) {
        var f = 0;
        if (e) {
            var b = e.replace(",", ".");
            var d = b.split(".");
            var h = d[0];
            var a = parseFloat("0." + d[1]);
            var g = h.split(":");
            for (var c = 0; c < g.length; c++) {
                f = f * 60 + parseInt(g[c])
            }
            f = f + a;
            if (Subtitles.timeHack != 1) {
                f = Subtitles.timeHack * f
            }
        }
        return f
    },
    parseDfxp: function(l) {
        if (window.DOMParser) {
            var c = new DOMParser();
            xmlDoc = c.parseFromString(l, "text/xml")
        } else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(l)
        }
        var u = xmlDoc.getElementsByTagName("div");
        if (u.length <= 0) {
            return
        }
        if (u.length > 1) {
            u = [u[0]]
        }
        var p = [];
        var h = [];
        for (var d = 0; d < u.length && d < Subtitles.tracksLimit; d++) {
            var m = [];
            var f = 0;
            var b = u[d].getElementsByTagName("div");
            if (b.length > 0 && b[0].hasAttribute("begin")) {} else {
                b = u[d].getElementsByTagName("p")
            }
            for (var k = 0; k < b.length; k++) {
                is = this.toSeconds(b[k].getAttribute("begin"));
                os = this.toSeconds(b[k].getAttribute("end"));
                t = b[k].getElementsByTagName("span");
                var a = "";
                try {
                    if (t && t.length >= 1) {
                        for (var g = 0; g < t.length; g++) {
                            a = a + "<br/>" + t[g].textContent
                        }
                    } else {
                        a = b[k].textContent
                    }
                } catch (r) {}
                if (a.length == 0) {
                    continue
                }
                m[f] = {
                    i: k,
                    start: is,
                    end: os,
                    txt: a,
                    prev: f - 1,
                    next: -1
                };
                if (f > 0) {
                    m[f - 1]["next"] = f
                }
                f++
            }
            p[p.length] = m;
            var q = u[d].getAttribute("xml:lang");
            h[h.length] = q ? q : "ES"
        }
        Subtitles.subtitles = p[0];
        Subtitles.currentSubtitle = 0;
        Subtitles.subtitleLanguages = h;
        Subtitles.allSubtitles = p
    },
    parseSrt: function(b) {
        b = b.replace(/\r\n|\r|\n/g, "\n");
        var a = 0;
        var d = [];
        b = this.strip(b);
        var c = b.split("\n\n");
        for (s in c) {
            if (c.hasOwnProperty(s)) {
                st = c[s].split("\n");
                if (st.length >= 2) {
                    n = st[0];
                    i = this.strip(st[1].split(" --> ")[0]);
                    o = this.strip(st[1].split(" --> ")[1]);
                    t = st[2];
                    if (st.length > 2) {
                        for (j = 3; j < st.length; j++) {
                            t += "\n" + st[j]
                        }
                    }
                    is = this.toSeconds(i);
                    os = this.toSeconds(o);
                    d[a] = {
                        i: i,
                        start: is,
                        end: os,
                        txt: t,
                        prev: a - 1,
                        next: -1
                    };
                    if (a > 0) {
                        d[a - 1]["next"] = a
                    }
                    a++
                }
            }
        }
        Subtitles.subtitles = d;
        Subtitles.currentSubtitle = 0;
        Subtitles.allSubtitles = [d];
        Subtitles.subtitleLanguages = ["ES "]
    },
    showTimeout: null,
    hideTimeout: null,
    startTimeout: null,
    deinit: function() {
        this.stop(true);
        clearTimeout(this.hideTimeout);
        Subtitles.subtitles = null;
        Subtitles.allSubtitles = null;
        Subtitles.subtitleLanguages = null;
        Subtitles.currentSubtitle = -1;
        Subtitles.language = "";
        Subtitles.showInfo();
        try {
            Subtitles.showAudioInfo("")
        } catch (a) {}
    },
    stop: function(a) {
        if (Subtitles.DISABLED === true) {
            return
        }
        clearTimeout(this.showTimeout);
        clearTimeout(this.startTimeout);
        if (a !== false) {
            this.started = false
        }
    },
    refresh: function(a) {
        if (Subtitles.DISABLED === true) {
            return
        }
        if (typeof a === "undefined") {
            a = 3000
        }
        clearTimeout(this.startTimeout);
        this.startTimeout = setTimeout(function() {
            Subtitles.start()
        }, a)
    },
    pause: function() {
        if (Subtitles.DISABLED === true) {
            return
        }
        this.stop(true);
        this.send("")
    },
    start: function(f) {
        if (Subtitles.DISABLED === true) {
            return false
        }
        if (Subtitles.subtitlesAreEnabled() == false) {
            return false
        }
        try {
            if (this.subtitles == null) {
                if (this.loading == false) {
                    return false
                }
                clearTimeout(this.startTimeout);
                this.startTimeout = setTimeout("Subtitles.start();", 2000);
                return false
            }
            var a = this.getpos();
            if (a <= 1 || VideoPlayer.initialBufferingComplete == false) {
                clearTimeout(this.startTimeout);
                this.startTimeout = setTimeout("Subtitles.start();", 1000);
                return false
            }
            if (typeof f === "undefined") {
                f = this.seek(a)
            }
            if (f < 0) {
                f = this.next(f);
                if (f < 0) {
                    return false
                }
            }
            Subtitles.showInfo();
            var b = this;
            var d = this.get(f).start;
            if (d - a < 0) {
                b.show(f)
            } else {
                this.send("");
                this.showTimeout = setTimeout(function() {
                    b.show(f)
                }, (d - a) * 1000)
            }
            Subtitles.started = true;
            return true
        } catch (c) {}
        return false
    },
    show: function(e) {
        this.stop(false);
        if (oldPlayerState != TVA_Player.state.playing) {
            this.refresh();
            return
        }
        var d = this.get(e);
        var f = this.next(e);
        var b = this.get(f);
        var c = this;
        var g = this.getpos();
        var a = d ? d.start : 0;
        if (g < a - 1000 || g > a + 1000 || !d) {
            Subtitles.refresh(500);
            return
        }
        this.send(d && d.txt ? d.txt : "");
        if (b) {
            var k = b.start - g;
            if (k < 0) {
                k = 0
            }
            this.showTimeout = setTimeout(function() {
                c.show(f)
            }, Math.floor(k * 1000))
        } else {}
        clearTimeout(this.hideTimeout);
        var h = (d.end - d.start);
        if (h > 0) {
            this.hideTimeout = setTimeout(function() {
                c.send("")
            }, Math.floor((h + 1) * 1000))
        } else {
            this.hideTimeout = setTimeout(function() {
                c.send("")
            }, 5 * 1000)
        }
    },
    send: function(a) {
        try {
            if (this.showFn) {
                this.showFn(a)
            }
        } catch (b) {}
    },
    seek: function(c) {
        for (var b = 0; b < this.subtitles.length; b++) {
            var a = this.subtitles[b].start;
            if (a > c) {
                return b - 1
            }
        }
        return -1
    },
    get: function(a) {
        if (a >= 0 && a < this.subtitles.length) {
            return this.subtitles[a]
        }
        return null
    },
    next: function(a) {
        if (a < 0) {
            return 0
        }
        if (a >= this.subtitles.length) {
            return -1
        }
        return a + 1
    },
    showNext: function() {
        if (Subtitles.started == true) {
            var a = Subtitles.currentSubtitle + 1;
            if (a >= Subtitles.allSubtitles.length) {
                Subtitles.disable();
                Subtitles.currentSubtitle = -1;
                Subtitles.showInfo();
                return "OFF"
            } else {
                Subtitles.currentSubtitle = a;
                Subtitles.subtitles = Subtitles.allSubtitles[Subtitles.currentSubtitle];
                Subtitles.showInfo();
                return Subtitles.subtitleLanguages[Subtitles.currentSubtitle]
            }
        } else {
            Subtitles.currentSubtitle = 0;
            Subtitles.subtitles = Subtitles.allSubtitles[Subtitles.currentSubtitle];
            Subtitles.enable();
            Subtitles.showInfo();
            return "" + Subtitles.subtitleLanguages[Subtitles.currentSubtitle]
        }
    },
    showInfo: function() {
        try {
            var b = $("#video-subt-info");
            if (Subtitles.currentSubtitle >= 0 && Subtitles.currentSubtitle < Subtitles.subtitleLanguages.length) {
                b.removeClass("hide-this");
                b.find(".video-info-span").html("" + Subtitles.subtitleLanguages[Subtitles.currentSubtitle])
            } else {
                b.addClass("hide-this")
            }
        } catch (a) {}
    }
};
Subtitles.showAudioInfo = function(a) {
    try {
        if (a === "UNDEFINED" || a === "undefined" || typeof a === "undefined") {
            a = ""
        }
        var c = $("#video-audio-info");
        if (typeof a === "string" && a.length > 0) {
            c.removeClass("hide-this").find(".video-info-span").html(a)
        } else {
            c.addClass("hide-this").find(".video-info-span").html(a)
        }
    } catch (b) {}
};
Subtitles._setAudioInfo = TVA_Player.setAudioInfo;
TVA_Player.setAudioInfo = function(b) {
    var a = Subtitles._setAudioInfo(b);
    Subtitles.showAudioInfo(a)
};
Subtitles._setAudioTrack = TVA_Player.setAudioTrack;
TVA_Player.setAudioTrack = function(a) {
    var b = Subtitles._setAudioTrack(a);
    Subtitles.showAudioInfo(b)
};
