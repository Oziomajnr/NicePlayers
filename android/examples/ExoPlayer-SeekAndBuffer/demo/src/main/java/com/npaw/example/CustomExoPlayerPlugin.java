package com.npaw.example;


import com.google.android.exoplayer.ExoPlaybackException;
import com.google.android.exoplayer.ExoPlayer;
import com.google.android.exoplayer.ExoPlayerLibraryInfo;
import com.npaw.youbora.plugins.PluginGeneric;
import com.npaw.youbora.youboralib.managers.ViewManager;

import org.json.JSONException;

import java.util.Map;

public class CustomExoPlayerPlugin extends PluginGeneric implements ExoPlayer.Listener {

    private Double lastBitrateReported;

    // Constructors
    public CustomExoPlayerPlugin(String options) throws JSONException {
        super(options);
    }

    public CustomExoPlayerPlugin(Map<String, Object> options) {
        super(options);
    }

    @Override
    protected void init() {
        super.init();
        pluginName = "ExoPlayer";
        pluginVersion = "5.3.0-c1.0-ExoPlayer";

        ViewManager.setMonitoringInterval(200);
    }

    // Start monitoring and stop monitoring
    @Override
    public void startMonitoring(Object player) {
        super.startMonitoring(player);

        enableSeekMonitor();

        lastBitrateReported = super.getBitrate();
        getPlayer().addListener(this);
    }
    @Override
    public void stopMonitoring() {
        // Cleanup
        ExoPlayer player = getPlayer();
        if (player != null) {
            player.removeListener(this);
        }

        // Super call will send stop, kill timers, etc. and set the plugin to null
        super.stopMonitoring();
    }

    // ExoPlayer.Listener interface methods
    @Override
    public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {

        switch (playbackState) {
            case ExoPlayer.STATE_BUFFERING:
                bufferingHandler(); // Buffer start
                break;
            case ExoPlayer.STATE_ENDED:
                endedHandler(); // Stop event
                break;
            case ExoPlayer.STATE_PREPARING:
                playHandler(); // Start event
                break;
            case ExoPlayer.STATE_READY:
                joinHandler(); // Join event
                bufferedHandler(); // Buffer end event
                break;
            default:
                break;
        }

        if (playWhenReady) {
            resumeHandler(); // Resume event (after pause)
        } else {
            pauseHandler(); // Pause event
        }
    }

    @Override
    public void onPlayWhenReadyCommitted() {

    }

    @Override
    public void onPlayerError(ExoPlaybackException error) {

    }

    // Info
    @Override
    public Double getMediaDuration() {
        double duration = getPlayer().getDuration();
        if (duration == ExoPlayer.UNKNOWN_TIME) {
            duration = super.getMediaDuration();
        }
        return duration;
    }

    @Override
    public Double getPlayhead() {
        return ((double) getPlayer().getCurrentPosition()) / 1000;
    }

    @Override
    public String getPlayerVersion() {
        return "ExoPlayer" + ExoPlayerLibraryInfo.VERSION;
    }

    // Private methods
    private ExoPlayer getPlayer() {
        return (ExoPlayer) this.player;
    }

    // Public methods
    public void updateBitrate(Double bitrate) {
        this.lastBitrateReported = bitrate;
    }
}
