/**
 * @license
 * Youbora Plugin native html5 player
 * Copyright NicePopleAtWork <http://nicepeopleatwork.com/>
 * @author Jordi Aguilar
 */

if (typeof $YB != "undefined") {

    $YB.plugins.Html5 = function(playerId, options) {
        try {
            /** Name and platform of the plugin.*/
            this.pluginName = 'html5';

            /** Version of the plugin. ie: 5.1.0-name */
            this.pluginVersion = '5.3.0-html5';

            /* Initialize YouboraJS */
            this.startMonitoring(playerId, options);

            // Register the listeners. Comment this line if you want to instantiate the plugin async.
            this.registerListeners();
        } catch (err) {
            $YB.error(err);
        }
    };

    /** Inherit from generic plugin */
    $YB.plugins.Html5.prototype = new $YB.plugins.Generic;

    /** Returns the current playhead of the video or 0. */
    $YB.plugins.Html5.prototype.getPlayhead = function() {
        return this.player.currentTime;
    };

    /** Returns the media duration of the video or 0. */
    $YB.plugins.Html5.prototype.getMediaDuration = function() {
        return this.player.duration;
    };

    /** Returns the src of the resource or an empty string. */
    $YB.plugins.Html5.prototype.getResource = function() {
        return this.player.currentSrc;
    };

    $YB.plugins.Html5.prototype.getPlayerVersion = function() {
        return "HTML5";
    };

    /** Register Listeners */
    $YB.plugins.Html5.prototype.registerListeners = function() {
        try {
            // Report events as Debug messages
            $YB.utils.listenAllEvents(this.player);

            // Start buffer watcher. Requires data.enableNiceBuffer to be true.
            this.enableBufferMonitor();

            // save context
            var context = this;

            // Play is clicked (/start)
            this.player.addEventListener("play", function(e) {
                try {
                    context.playHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video starts (/joinTime)
            this.player.addEventListener("timeupdate", function(e) {
                try {
                    if (context.getPlayhead() > 0.1) {
                        context.joinHandler();
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });

            this.player.addEventListener("playing", function(e) {
                try {
                    if (context.viewManager.isJoinSent) {
                        context.playingHandler();
                    }
                } catch (error) {
                    $YB.error(error);
                }
            });

            // Video pauses (pause)
            this.player.addEventListener("pause", function(e) {
                try {
                    context.pauseHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video ends (stop)
            this.player.addEventListener("ended", function(e) {
                try {
                    context.endedHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video error (error)
            this.player.addEventListener("error", function(e) {
                try {
                    context.errorHandler("PLAY_FAILURE");
                } catch (error) {
                    $YB.error(error);
                }
            });

            // video seek start
            this.player.addEventListener("seeking", function(e) {
                try {
                    context.seekingHandler();
                } catch (error) {
                    $YB.error(error);
                }
            });
        } catch (err) {
            $YB.error(err);
        }
    };
}
