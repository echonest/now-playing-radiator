NowPlaying = function(api, user, interval) {
    this.lastArtist = '';
    this.lastUser = '';
    
    /* AutoUpdate frequency - Last.fm API rate limits at 1/sec */
    this.interval = interval || 5;
};
NowPlaying.prototype = {
    
    display: function()
    {        
        // sneaky image one-liner borrowed from TwitSpace™
        var image = "http://ws.audioscrobbler.com/2.0/?method=artist.getimageredirect&artist=" + encodeURI(_currentComposer) + "&api_key=b25b959554ed76058ac220b7b2e0a026&size=original";
        $('body').css("background-image", "url('" + image + "')");
        $('#artist').html('<span class="separator">by </span> ' + _currentComposer);
        $('#track').text(_currentTrack);
        $('#art').attr("src",_currentAlbumArtURL);
    },
    
    update: function()
    {
        refreshCurrentlyPlaying();
        this.display();
    },
    
    autoUpdate: function()
    {
        // Do an immediate update, don't wait an interval period
        this.update();
        
        // Try and avoid repainting the screen when the track hasn't changed
        setInterval(jQuery.proxy(this.update, this), this.interval * 1000);
    },
    
    updateHeader: function(track)
    {
        
        if (track.nowplaying)
            var status = 'Now playing';
        else
            var status = 'Last played';
        
        var head = status + " at Echo Nest HQ (Somerville, MA):";
        $('.header').html(head);
    }
};