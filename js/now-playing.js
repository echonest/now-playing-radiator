NowPlaying = function(api, user, interval) {
    this.lastArtist = '';
    this.lastUser = '';
    
    /* AutoUpdate frequency - Last.fm API rate limits at 1/sec */
    this.interval = interval || 5;
};
NowPlaying.prototype = {
    
    display: function(track)
    {        
        if (track.artist == ' ') { // clear background
            $('body').css("background-image", "");
        }
        else if (track.artist != this.lastArtist ) {
            // sneaky image one-liner borrowed from TwitSpace™
            var image = "http://ws.audioscrobbler.com/2.0/?method=artist.getimageredirect&artist=" + encodeURI(track.artist) + "&api_key=b25b959554ed76058ac220b7b2e0a026&size=original";
            $('body').css("background-image", "url('" + image + "')");
        }
        if (track.artist != ' ')
            $('#artist').html('<span class="separator">by </span> ' + track.artist);
        else
            $('#artist').html('<span class="separator">[silence]</span>');
        $('#track').text(track.name);
        if (track.artist != ' ')
            this.lastArtist = track.artist;
        this.updateHeader(track);
    },
    
    update: function()
    {
        refreshCurrentlyPlaying();
        this.api.getNowPlayingTrack(
            this.user,
            jQuery.proxy(this.handleResponse, this), 
            function(error) { console && console.log(error); }
        );
    },
    
    autoUpdate: function()
    {
        // Do an immediate update, don't wait an interval period
        this.update();
        
        // Try and avoid repainting the screen when the track hasn't changed
        setInterval(jQuery.proxy(this.update, this), this.interval * 1000);
    },
    
    handleResponse: function(response)
    {
        if (response) {
            var nowplaying = response['@attr'] && response['@attr'].nowplaying;
            this.display({
                // The API response can vary depending on the user, so be defensive
                artist: response.artist['#text'] || response.artist.name,
                name: response.name,
                nowplaying: nowplaying
            });
        }
        else {
            this.display({artist: ' ', name: ''});
        }
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