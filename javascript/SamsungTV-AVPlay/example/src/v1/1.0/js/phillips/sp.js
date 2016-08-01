/**
 * Created for NicePeopleAtWork.
 * User: Miquel Fradera.
 * Date: 4/02/14
 * Time: 12:57
 */

var SmartPluginAnalyticsEvents = {
    BUFFER_BEGIN: 1,
    BUFFER_END: 0
};
var SmartPlugin = { 
    smartPlugin: {},
    Init: function()  {  
        try
        {                           
            var videoPlayer                   = document.videoPlayer.id;
            var bandwidth                     = {};
                                
            SmartPlugin.smartPlugin   = new SmartPluginAnalytics ( videoPlayer , youboraData.getAccountCode() , youboraData.getService() , bandwidth );
                               
            SmartPlugin.smartPlugin.setPlayerStateCallback("checkPlayState");
            SmartPlugin.smartPlugin.setLive( youboraData.getLive() );
            SmartPlugin.smartPlugin.setUsername(youboraData.getUsername() );
        }
        catch(err)
        {
            console.log( "SmartPluginAnalytics :: Error while get video object" );
            console.log(err);
        }
    }
}; 
/**
 * Plugin definition.
 * @param playerId
 * @param system
 * @param service
 * @param playInfo
 */
function SmartPluginAnalytics(playerId, system, service, playInfo)
{
    /**
     * Attributes.
     */
    this.playerId = playerId;
    this.system = system;
    this.service = service;
    this.playInfo = playInfo;
    this.bandwidth = playInfo;

    // player reference
    this.player = null;
    this.playStateCallback = "";

    // configuration
    this.pluginVersion = "2.2.1_philipstv";
    this.targetDevice = "Philips_InternetTV";

    // events
    this.isStartEventSent = false;
    this.isJoinEventSent = false;
    this.isStopEventSent = false;
    this.isBufferRunning = false;
    this.isPauseEventSent = false;

    // properties
    this.assetMetadata = {};
    this.isLive = false;
    this.bufferTimeBegin = 0;
  
    // code
    this.pamCode = "";
    this.pamCodeOrig = "";
    this.pamCodeCounter = 0;

    // ping
    this.pamPingTime = 0;
    this.lastPingTime = 0;
    this.diffTime = 0;
    this.pingTimer = null;

    //Communication interface
    this.communications ={};

    /**
     * Initialization.
     */
    this.init();
};

/**
 * Plugin setup.
 */
SmartPluginAnalytics.prototype.init = function()
{

    var context = this;
    this.player = document.getElementById(this.playerId);
    console.log(this.player.data);
    this.player.onPlayStateChange = function(){ context.checkPlayState(); };
    this.communications = new YouboraCommunication(this.system , this.service ,  this.bandwidth , this.pluginVersion , this.targetDevice );
    this.pamPingTime = this.communications.getPingTime();
   
    
};


SmartPluginAnalytics.prototype.updateCode = function()
{
    this.pamCodeCounter++;
    this.pamCode = this.pamCodeOrig + "_" + this.pamCodeCounter;
};

SmartPluginAnalytics.prototype.reset = function()
{
    this.isStartEventSent = false;
    this.isJoinEventSent = false;
    this.isBufferRunning = false;
    this.isPauseEventSent = false;
    this.bufferTimeBegin = 0;

    clearTimeout(this.pingTimer);
    this.pingTimer = null;
    this.lastPingTime = 0;
    this.diffTime = 0;

    this.updateCode();
};

/**
 * Plugin methods. Getters and Setters.
 */
SmartPluginAnalytics.prototype.setPlayerStateCallback = function(callback)
{
    this.playStateCallback = callback;
};

SmartPluginAnalytics.prototype.setUsername = function(username)
{
    this.playInfo.username = username;
};

SmartPluginAnalytics.prototype.setMetadata = function(metadata)
{
    this.assetMetadata = metadata;
};

SmartPluginAnalytics.prototype.getMetadata = function()
{
    var jsonObj = JSON.stringify(this.assetMetadata);
    var metadata = encodeURIComponent(jsonObj);

    return metadata;
};

SmartPluginAnalytics.prototype.setLive = function(value)
{
    this.isLive = value;
};

SmartPluginAnalytics.prototype.setTransactionCode = function(trans)
{
    this.playInfo.transaction = trans;
};

SmartPluginAnalytics.prototype.getBitrate = function()
{
    try
    {
        var playInfo = this.player.mediaPlayInfo();
    }
    catch (err)
    {
		return -1;
    }
	//return playInfo.bitrateInstant;
};

SmartPluginAnalytics.prototype.setPing = function()
{
    var context = this;
    this.pingTimer = setTimeout(function(){ context.ping(); }, this.pamPingTime);
};

/**
 * Plugin events. Analytics.
 */
SmartPluginAnalytics.prototype.start = function()
{
    var d = new Date();

    console.log(this.player);
    try{
        this.communications.sendStart ( 0 , window.location.href , this.getMetadata() , this.isLive ,  this.player.data, this.duration);
    }catch(err){
        console.log(err);
    }

    this.setPing();
    this.lastPingTime = d.getTime();
};

SmartPluginAnalytics.prototype.ping = function()
{
    clearTimeout(this.pingTimer);
    try{
        this.communications.sendPingTotalBitrate(this.getBitrate(),this.player.playPosition/1000);
        this.setPing();
    }catch(err){
        console.log(err);
    }
};

SmartPluginAnalytics.prototype.buffer = function(bufferState)
{
    var d = new Date();
    var bufferTimeEnd = 0;
    var bufferTimeTotal = 0;
    var params = null;
    if (bufferState == SmartPluginAnalyticsEvents.BUFFER_BEGIN)
    {
        this.bufferTimeBegin = d.getTime();
    }
    else if (bufferState == SmartPluginAnalyticsEvents.BUFFER_END)
    {
        bufferTimeEnd = d.getTime();
        bufferTimeTotal = bufferTimeEnd - this.bufferTimeBegin;

        if (!this.isJoinEventSent)
        {
           
            this.isJoinEventSent = true;
            console.log("Join , " + bufferTimeTotal);
            this.communications.sendJoin(this.player.playPosition/1000, bufferTimeTotal);
        }
        else
        {
            this.communications.sendBuffer(this.player.playPosition/1000 ,bufferTimeTotal );

        }
    }
};

SmartPluginAnalytics.prototype.resume = function()
{

    this.communications.sendResume();

};

SmartPluginAnalytics.prototype.pause = function()
{
     this.communications.sendPause();
};

SmartPluginAnalytics.prototype.stop = function()
{
    this.communications.sendStop();

    clearTimeout(this.pingTimer);
    this.pingTimer = null;

    this.reset();
};

SmartPluginAnalytics.prototype.error = function()
{

    this.communications.sendError(this.player.error,"");
    clearTimeout(this.pingTimer);
    this.pingTimer = null;
};

/**
 * Plugin events. Player.
 */
SmartPluginAnalytics.prototype.checkPlayState = function()
{   
    //console.log(this.player.keys);
    switch (this.player.playState)
    {
        case 0:     // stopped
            if (!this.isStopEventSent)
            {
                this.isStopEventSent = true;
                this.stop();
            }
            break;
        case 1:     // playing
            if (this.isStopEventSent)
            {
                this.isStopEventSent = false;
            }

            if (!this.isStartEventSent)
            {
                this.isStartEventSent = true;
                this.start();
            }
            else if (this.isPauseEventSent)
            {
                this.isPauseEventSent = false;
                this.resume();
            }

            if (!this.isJoinEventSent && !this.isBufferRunning)
            {
                //this.buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
                this.buffer(SmartPluginAnalyticsEvents.BUFFER_END);
            }

            if (this.isBufferRunning)
            {
                this.isBufferRunning = false;
                this.buffer(SmartPluginAnalyticsEvents.BUFFER_END);
            }
            break;
        case 2:     // paused
            this.isPauseEventSent = true;
            this.pause();
            break;
        case 3:     // connecting
			if (!this.isJoinEventSent && !this.isBufferRunning)
            {
                this.buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
                //this.buffer(SmartPluginAnalyticsEvents.BUFFER_END);
            }
            break;
        case 4:     // buffering
            this.isBufferRunning = true;
            this.buffer(SmartPluginAnalyticsEvents.BUFFER_BEGIN);
            break;
        case 5:     // finished
            if (!this.isStopEventSent)
            {
                this.isStopEventSent = true;
                this.stop();
            }
            break;
        case 6:     // error
            this.error();
            if (!this.isStopEventSent)
            {
                this.isStopEventSent = true;
                this.stop();
            }
            break;
    }

    eval(this.playStateCallback + "()");
};

// TODO: add events queue logic
