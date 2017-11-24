(function(exports) {
    'use strict';
    //initialize the app
    var settings = {
        Model: JSONMediaModel,
        PlayerView: RadiantMediaPlayerView,
        PlaylistView: PlaylistPlayerView,
        dataURL: "./assets/rmpMediaData.json",
        showSearch: true,
        displayButtons:false,
        skipLength: 10,
        controlsHideTime: 3000, 
        networkTimeout: 20,
        retryTimes: 3
    };

    exports.app = new App(settings);
}(window));
