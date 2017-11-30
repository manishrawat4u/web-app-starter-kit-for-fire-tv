/* Radiant Media Player View
 *
 * Handles the media playback videos with Radiant Media Player
 *
 */

(function (exports) {
    "use strict";

    /**
     * @class RadiantMediaPlayerView
     * @description Handles the media playback videos with Radiant Media Player
     */
    function RadiantMediaPlayerView(settings) {
        // mixin inheritance, initialize this as an event handler for these events:
        Events.call(this, ['exit', 'videoStatus', 'videoError', 'indexChange', 'error']);

        //jquery variables
        this.$el = null;
        this.$currSeekTime = null;

        //class variables
        this.currentVideo = null;
        this.controlsView = null;
        this.durationFound = false;
        this.fullscreenOpen = false;
        this.isAdPlaying = false;
        this.items = null;
        this.currentIndex = null;
        this.scriptLoaded = false;
        this.buttonDowntime = null;
        this.isSkipping = false;
        this.isFF = false;
        this.isRW = false;

        // rmp variables
        this.debug = false;
        this.rmp = null;
        this.rmpContainer = null;
        this.destroyCompleted = false;
        this.isLive = false;
        this.getCurrentTime = function () {
            if (this.rmp) {
                var currentTime = this.rmp.getCurrentTime();
                if (currentTime > -1) {
                    return (currentTime / 1000);
                }
            }
            return -1;
        }.bind(this);
        this.getDuration = function () {
            if (this.rmp) {
                var duration = this.rmp.getDuration();
                if (duration > -1) {
                    return (duration / 1000);
                }
            }
            return -1;
        }.bind(this);

        //constants
        this.SCRIPT_TIMEOUT = 30000;
        this.SKIP_LENGTH_DEFAULT = 5;
        this.BUTTON_INTERVALS = [100, 200, 300, 400, 500];
        // the button intervals for when slowing fast forward near the end of the video
        this.DECELLERATION_BUTTON_INTERVALS = [500, 400, 300, 200, 100];
        // the fast forward/reverse individual jump percentage higher is faster
        this.FAST_SEEK_JUMP_AMOUNT = 0.03;
        // the percentage left in the video when slowing fast forward begins
        this.DECELLERATION_PERCENTAGE_MOMENT = 0.3;
        this.currButtonSpeed = null;

        //set skip length
        this.skipLength = settings.skipLength || this.SKIP_LENGTH_DEFAULT;

        /** 
         * @function hasValidTimeAndDuration
         * @description function that checks if Radiant Media Player has valid duration and current time
         * @return {Boolean}
         */
        this.hasValidTimeAndDuration = function () {
            if (this.getDuration() > -1 && this.getCurrentTime() > -1) {
                return true;
            }
            return false;
        }.bind(this);

        /**
         * @function registerAdPlayerEvents
         * @description function that registers events corresponding to ad playback 
         */
        this.registerAdPlayerEvents = function () {
            if (this.debug) {
                console.log('registerAdPlayerEvents');
            }
            this.rmpContainer.addEventListener('adloadererror', function () {
                this.isAdPlaying = false;
                this.updateTitleAndDescription(this.currentVideo.title, this.currentVideo.description);
            }.bind(this));
            this.rmpContainer.addEventListener('aderror', function () {
                this.isAdPlaying = false;
                this.updateTitleAndDescription(this.currentVideo.title, this.currentVideo.description);
            }.bind(this));
            this.rmpContainer.addEventListener('adstarted', function () {
                this.isAdPlaying = true;
                this.updateTitleAndDescription("Advertisement", "Your video will resume shortly.");
            }.bind(this));
            this.rmpContainer.addEventListener('addestroyed', function () {
                this.isAdPlaying = false;
                this.updateTitleAndDescription(this.currentVideo.title, this.currentVideo.description);
            }.bind(this));
        }.bind(this);

        /**
         * @function pauseEventHandler
         * @description Handles video element pause event
         */
        this.pauseEventHandler = function () {
            // we trigger the video status in the pause event handler because the pause event can come from the system
            // specifically it can be caused by the voice search functionality of Fire OS
            if (this.getCurrentTime() > 0 && this.getCurrentTime() !== this.getDuration()) {
                this.trigger('videoStatus', this.getCurrentTime(), this.getDuration(), 'paused');
            }
        }.bind(this);

        /**
         * @function setScriptTimeout
         * @description Makes sure we have rmp.min.js script on page
         */
        this.setScriptTimeout = function () {
            setTimeout(function () {
                if (!this.scriptLoaded) {
                    this.trigger('error', ErrorTypes.EMBEDDED_PLAYER_ERROR, errorHandler.genStack());
                }
            }.bind(this), this.SCRIPT_TIMEOUT);
        }.bind(this);

        /**
         * @function videoEndedHandler
         * @description handler for video 'ended' event
         */
        this.videoEndedHandler = function () {
            if (this.hasValidTimeAndDuration()) {
                this.trigger('videoStatus', this.getCurrentTime(), this.getDuration(), 'ended');
            }
        }.bind(this);

        /*
         * @function controlsCurrentlyShowing
         * @description check if controls are currently showing status indicator
         * @return {Boolean}
         */
        this.controlsCurrentlyShowing = function () {
            return this.controlsView.controlsShowing();
        }.bind(this);

        /*
         * @function durationChangeHandler
         * @description handler for the 'durationchange' event
         */
        this.durationChangeHandler = function () {
            if (this.hasValidTimeAndDuration()) {
                this.trigger('videoStatus', this.getCurrentTime(), this.getDuration(), 'durationChange');
                this.durationFound = true;
            }
        }.bind(this);

        /*
         * @function timeUpdateHandler
         * @description handler for the 'timeupdate' event
         */
        this.timeUpdateHandler = function () {
            if (this.debug) {
                console.log('timeUpdateHandler');
            }
            if (this.previousTime !== this.getCurrentTime()) {
                this.previousTime = this.getCurrentTime();
            }
            if (this.hasValidTimeAndDuration() && !this.isSkipping) {
                this.buttonDowntime = this.getCurrentTime();
                this.trigger('videoStatus', this.getCurrentTime(), this.getDuration(), 'playing');
            }
        }.bind(this);

        /*
         * @function errorHandler
         * @description Handler for the media 'error' event
         * @param {Event} e the error event
         */
        this.errorHandler = function (e) {
            if (this.debug) {
                console.log('errorHandler');
            }
            this.trigger('error', ErrorTypes.EMBEDDED_PLAYER_ERROR, errorHandler.genStack());
        }.bind(this);

        /**
         * @function remove
         * @description remove Radiant Media Player from the app
         */
        this.remove = function () {
            if (this.debug) {
                console.log('remove');
            }
            $("#app-container").removeClass('rmp-black-bg');
            buttons.resetButtonIntervals();
            this.rmpContainer.addEventListener('destroycompleted', function () {
                this.rmpContainer.remove();
                this.$el.remove();
                this.rmpContainer = null;
                this.destroyCompleted = true;
            }.bind(this));
            this.rmp.destroy();
        }.bind(this);

        /**
         * @function hide
         * @description hide the video
         */
        this.hide = function () {
            if (this.debug) {
                console.log('hide');
            }
            this.$el.css("visibility", "hidden");
        }.bind(this);

        /**
         * @function show
         * @description show the video
         */
        this.show = function () {
            if (this.debug) {
                console.log('show');
            }
            this.$el.css("visibility", "");
            if (this.durationFound) {
                this.controlsView.showAndHideControls();
            }
        }.bind(this);

        /**
         * Update title and description of the video
         * @param {string} title to set
         * @param {string} description to set
         */
        this.updateTitleAndDescription = function (title, description) {
            if (this.debug) {
                console.log('updateTitleAndDescription');
            }
            if (this.controlsView) {
                this.controlsView.updateTitleAndDescription(title, description);
            }
        }.bind(this);

        /**
         * @function adPlaying
         * @description function that returns true if ad is playing
         * @return {Boolean}
         */
        this.adPlaying = function () {
            return this.isAdPlaying;
        }.bind(this);


        this.initPlayer = function (videoURL, imgURL, adTagUrl, aspectRatio, isLive) {
            if (this.debug) {
                console.log('initPlayer');
            }
            // Then we set our player settings
            var hlsPattern = /\.m3u8/i;
            var bitrates = {};
            if (hlsPattern.test(videoURL)) {
                bitrates.hls = videoURL;
            } else {
                bitrates.mp4 = [videoURL];
            }
            var settings = {
                licenseKey: 'your-license-key',
                bitrates: bitrates,
                poster: imgURL,
                // the below are required settings to fit the Fire TV app environment
                hideControls: true,
                autoplay: true,
                googleCast: false,
                useNativeHlsOverMseHls: true,
                disableKeyboardControl: true,
                autoHeightMode: true
            };
            if (adTagUrl) {
                settings.ads = true;
                // you could use the HTML5 IMA SDK but since Fire TV is not 
                // official supported by the IMA SDK support cannot 
                // be guaranteed - so we use rmp-vast instead which supports 
                // Android WebView
                settings.adParser = 'rmp-vast';
                settings.adTagUrl = adTagUrl;
            }
            if (aspectRatio) {
                settings.autoHeightModeRatio = aspectRatio;
            }
            if (isLive) {
                settings.isLive = true;
                this.isLive = true;
            }
            // Reference to our container div (unique id)
            var elementID = 'rmpPlayer';
            // Create an object based on RadiantMP constructor
            this.rmp = new RadiantMP(elementID);
            this.rmpContainer = document.getElementById(elementID);
            this.rmpContainer.addEventListener('ready', function () {
                // when player is ready wire listeners
                if (this.debug) {
                    console.log('ready');
                }
                $("#app-container").addClass('rmp-black-bg');
                // handles non 16:9 ratio
                var playerHeight = this.rmp.getPlayerHeight();
                var screenHeight = window.screen.height;
                if (typeof playerHeight === 'number' && typeof screenHeight === 'number') {
                    if (playerHeight > 0 && screenHeight > 0 && screenHeight > playerHeight) {
                        this.rmpContainer.style.top = ((screenHeight - playerHeight) / 2) + 'px';
                    }
                }
                this.scriptLoaded = true;
                this.rmpContainer.addEventListener("ended", this.videoEndedHandler);
                this.rmpContainer.addEventListener("timeupdate", this.timeUpdateHandler);
                this.rmpContainer.addEventListener("error", this.errorHandler);
                this.rmpContainer.addEventListener("durationchange", this.durationChangeHandler);
                this.rmpContainer.addEventListener("pause", this.pauseEventHandler);
                this.registerAdPlayerEvents();
            }.bind(this));
            // Initialization
            this.rmp.init(settings);
        }.bind(this);

        /**
         * @function render
         * @description creates the main content view from the template and appends it to the given element
         * @param {Object} $container the app container
         * @param {Object} data the complete data
         * @param {Object} index the index corresponding to the data to be rendered
         */
        this.render = function ($container, data, index) {
            if (this.debug) {
                console.log('render');
            }
            // Build the main content template and add it
            this.items = data;
            var video_data = data[index];
            this.currentVideo = video_data;
            this.currentIndex = index;
            var html = utils.buildTemplate($("#player-view-template"), video_data);
            $container.append(html);
            this.$el = $container.children().last();
            this.$containerControls = $container.find(".player-controls-container");
            this.containerControls = this.$containerControls[0];

            // dynamically append the Radiant Media Player container
            this.$el.append('<div id="rmpPlayer"></div>');

            this.scriptLoaded = false;
            var videoURL = this.items[index].videoURL;
            var imgURL = this.items[index].imgURL;
            var adTagUrl = this.items[index].adTagUrl;
            var aspectRatio = this.items[index].aspectRatio;
            var isLive = this.items[index].live;

            // if rmp.min.js is already on page we init 
            // otherwise we load the lib
            if (typeof RadiantMP === 'undefined') { 
                var tag = document.createElement('script');
                this.$el.append(tag);
                tag.onload = function (url, img, adTag, ar, live) {
                    tag.onload = null;
                    this.initPlayer(url, img, adTag, ar, live);
                }.bind(this, videoURL, imgURL, adTagUrl, aspectRatio, isLive);
                tag.type = "text/javascript";
                if (this.debug) {
                    tag.src = "https://cdn.radiantmediatechs.com/rmp/v4/latest/js/rmp.debug.js";
                } else {
                    tag.src = "https://cdn.radiantmediatechs.com/rmp/v4/latest/js/rmp.min.js";
                }
            } else {
                this.initPlayer(videoURL, imgURL, adTagUrl, aspectRatio, isLive);
            }

            // start timeout to make sure RadiantMP global is available 
            // fire error otherwise
            this.setScriptTimeout();

            this.controlsView = new ControlsView();
            this.controlsView.render(this.$el, video_data, this);

        }.bind(this);

        /**
         * @function pauseAd
         * @description pause the currently playing ad, called when app loses focus
         */
        this.pauseAd = function () {
            if (this.debug) {
                console.log('pauseAd');
            }
            if (this.rmp) {
                this.rmp.pause();
            }
        }.bind(this);

        /**
         * @function resumeAd
         * @description resume the currently playing ad, called when app regains focus
         */
        this.resumeAd = function () {
            if (this.debug) {
                console.log('resumeAd');
            }
            if (this.rmp) {
                this.rmp.play();
                if (this.hasValidTimeAndDuration()) {
                    this.trigger('videoStatus', this.getCurrentTime(), this.getDuration(), 'resumed');
                }
            }
        }.bind(this);

        /**
         * @function playVideo
         * @description start the video playing
         */
        this.playVideo = function () {
            if (this.debug) {
                console.log('playVideo');
            }
            if (this.rmp) {
                this.rmp.play();
                if (this.hasValidTimeAndDuration()) {
                    this.buttonDowntime = this.getCurrentTime();
                    buttons.setButtonIntervals(this.BUTTON_INTERVALS);
                    this.currButtonSpeed = this.BUTTON_INTERVALS;
                    this.trigger('videoStatus', this.getCurrentTime(), this.getDuration(), 'playing');
                }
            }
        }.bind(this);

        /**
         * @function pauseVideo
         * @description pause the currently playing video, called when app loses focus
         */
        this.pauseVideo = function () {
            if (this.debug) {
                console.log('pauseVideo');
            }
            if (this.rmp) {
                this.rmp.pause();
            }
        }.bind(this);

        /**
         * @function resumeVideo
         * @description resume the currently playing video, called when app regains focus
         */
        this.resumeVideo = function () {
            if (this.debug) {
                console.log('resumeVideo');
            }
            if (this.rmp) {
                this.rmp.play();
                if (this.hasValidTimeAndDuration()) {
                    this.buttonDowntime = this.getCurrentTime();
                    this.trigger('videoStatus', this.getCurrentTime(), this.getDuration(), 'resumed');
                }
            }
        }.bind(this);

        /**
         * @function seekVideo
         * @description navigate to a position in the video
         * @param {Number} position the timestamp
         */
        this.seekVideo = function (position) {
            if (this.isLive) {
                return;
            }
            if (this.debug) {
                console.log('seekVideo');
            }
            if (this.hasValidTimeAndDuration()) {
                this.controlsView.continuousSeek = false;
                this.trigger('videoStatus', this.getCurrentTime(), this.getDuration(), 'playing');
                this.rmp.seekTo(position * 1000);
                this.trigger('videoStatus', this.getCurrentTime(), this.getDuration(), 'seeking');
            }
        }.bind(this);

        /**
         * @function handlePlayPauseButton
         * @description handle play/pasuse/select button events
         */
        this.handlePlayPauseButton = function () {
            if (!this.isSkipping) {
                if (this.isAdPlaying && this.rmp) {
                    if (this.rmp.getAdPaused()) {
                        this.resumeAd();
                    } else {
                        this.pauseAd();
                    }
                } else if (!this.isAdPlaying && this.rmp) {
                    if (this.rmp.getPaused()) {
                        this.resumeVideo();
                    } else {
                        this.pauseVideo();
                    }
                }
            }
        }.bind(this);

        /**
         * Navigate to a position in the video, used when holding down the buttons
         * @param {number} direction the seek direction, positive for forward, negative for reverse
         */
        this.seekVideoRepeat = function (direction) {
            if (this.isLive) {
                return;
            }
            this.controlsView.continuousSeek = true;
            var newPosition = null;
            if (direction > 0) {
                if (this.buttonDowntime < this.getDuration()) {
                    if (this.buttonDowntime > this.getDuration() - (this.getDuration() * this.DECELLERATION_PERCENTAGE_MOMENT)) {
                        buttons.setButtonIntervals(this.DECELLERATION_BUTTON_INTERVALS);
                        this.currButtonSpeed = this.DECELLERATION_BUTTON_INTERVALS;
                    }
                    else {
                        buttons.setButtonIntervals(this.BUTTON_INTERVALS);
                        this.currButtonSpeed = this.BUTTON_INTERVALS;
                    }
                    newPosition = this.buttonDowntime + (this.getDuration() * this.FAST_SEEK_JUMP_AMOUNT);
                } else {
                    newPosition = this.getDuration();
                }

            }
            else {
                if (this.currButtonSpeed !== this.BUTTON_INTERVALS) {
                    buttons.setButtonIntervals(this.BUTTON_INTERVALS);
                    this.currButtonSpeed = this.BUTTON_INTERVALS;
                }
                if (this.buttonDowntime > this.skipLength) {
                    newPosition = this.buttonDowntime - (this.getDuration() * this.FAST_SEEK_JUMP_AMOUNT);
                } else {
                    newPosition = 0;
                }
            }
            this.trigger('videoStatus', this.buttonDowntime, this.getDuration(), 'playing');

            //Move the indicator while pressing down the skip buttons by updating buttonDownTime
            this.buttonDowntime = newPosition;
            this.trigger('videoStatus', this.buttonDowntime, this.getDuration(), 'seeking');
        }.bind(this);

        /**
         * @function seekVideoFinal
         * @description Navigate to a position in the video, used when button released after continuous seek
         */
        this.seekVideoFinal = function () {
            if (this.isLive) {
                return;
            }
            if (this.isFF) {
                this.buttonDowntime = this.buttonDowntime !== this.getDuration() ? this.buttonDowntime - this.skipLength : this.buttonDowntime;
                this.isFF = false;
            } else if (this.isRW) {
                this.buttonDowntime = this.buttonDowntime !== 0 ? this.buttonDowntime + this.skipLength : 0;
                this.isRW = false;
            }
            this.trigger('videoStatus', this.buttonDowntime, this.getDuration(), 'playing');
            this.rmp.seekTo(this.buttonDowntime * 1000);
            this.trigger('videoStatus', this.buttonDowntime, this.getDuration(), 'seeking');
            this.isSkipping = false;
        }.bind(this);

        /**
         * @function handleControls
         * @description Handle button events, connected to video API for a few operations
         * @param {Event} e
         */
        this.handleControls = function (e) {
            if (e.type === 'buttonpress') {
                this.isSkipping = false;
                switch (e.keyCode) {
                    case buttons.BACK:
                        this.trigger('exit');
                        break;
                    case buttons.LEFT:
                    case buttons.REWIND:
                        // Disable seeking during Ad playback
                        if (!this.isAdPlaying && this.hasValidTimeAndDuration()) {
                            this.seekVideo(this.getCurrentTime() - this.skipLength);
                        }
                        break;

                    case buttons.RIGHT:
                    case buttons.FAST_FORWARD:
                        // Disable seeking during Ad playback
                        if (!this.isAdPlaying && this.hasValidTimeAndDuration()) {
                            this.seekVideo(this.getCurrentTime() + this.skipLength);
                        }
                        break;

                    case buttons.SELECT:
                    case buttons.PLAY_PAUSE:
                        this.handlePlayPauseButton();
                        break;
                    case buttons.UP:
                        this.controlsView.showAndHideControls();
                        break;
                    case buttons.DOWN:
                        if (this.rmp && !this.rmp.getPaused()) {
                            this.controlsView.hide();
                        }
                        break;
                }
            } else if (e.type === 'buttonrepeat') {
                switch (e.keyCode) {
                    case buttons.LEFT:
                    case buttons.REWIND:
                        this.isSkipping = true;
                        this.isRW = true;
                        if (!this.isAdPlaying) {
                            this.seekVideoRepeat(-1);
                        }
                        break;

                    case buttons.RIGHT:
                    case buttons.FAST_FORWARD:
                        this.isSkipping = true;
                        this.isFF = true;
                        if (!this.isAdPlaying) {
                            this.seekVideoRepeat(1);
                        }
                        break;
                }
            } else if (this.isSkipping && e.type === 'buttonrelease') {
                if (!this.isAdPlaying) {
                    this.seekVideoFinal();
                }
            }
        }.bind(this);

    }

    exports.RadiantMediaPlayerView = RadiantMediaPlayerView;

}(window));
