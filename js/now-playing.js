NowPlaying = function(api, user, interval) {
    this.interval = interval || 5;
    this.EN = nest.nest("5EYHYOVNFLJTJ1KOH");
    this._lastTrack = "";
};

NowPlaying.prototype = {
    
    display: function()
    {
        if (this._lastTrack != _currentTrack+_currentComposer) {
            // sneaky image one-liner borrowed from TwitSpace™
            var image = "http://ws.audioscrobbler.com/2.0/?method=artist.getimageredirect&artist=" + encodeURI(_currentComposer) + "&api_key=b25b959554ed76058ac220b7b2e0a026&size=original";
            $('body').css("background-image", "url('" + image + "')");
            $('#artist').html('<span class="separator">by </span> ' + _currentComposer);
            $('#track').text(_currentTrack);
            $('#art').attr("src",_currentAlbumArtURL);
            artist = this.EN.artist({"name":_currentComposer})
            artist.biographies({results: 2, start: 1, license: "cc-by-sa"}, function(err, results) {
                if (err) {
                    return;
                }
                $('#bio').text(results["biographies"][0]["text"].slice(0,350)+"...");
            });
            artist.similar({results: 10, start: 1}, function(err, results) {
                if (err) {
                    return;
                }
                var simstr = "";
                for( i=0; i < results["artists"].length;i++) {
                    simstr = simstr + results["artists"][i]["name"] + ", ";
                }
                $('#sims').text(simstr + "and MANY MORE");
            });
            
            // how does this work tyler
            /*
            song = this.EN.song({"title":_currentTrack,"artist":_currentComposer})
            console.log(song);
            if(song) {
                song.profile({bucket:"audio_summary"}, function(err, results) {
                    if (err) {
                        console.log(err)
                        return;
                    }
                    $('#bpm').text(results["songs"][0]["audio_summary"]["tempo"]);
                });
            }
            */
            this._lastTrack = _currentTrack+_currentComposer;
        }
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