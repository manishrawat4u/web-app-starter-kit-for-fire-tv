# Web App Starter Kit for Fire TV using Radiant Media Player

This repository is a fork of Amazon [Web App Starter Kit for Fire TV](https://github.com/amzn/web-app-starter-kit-for-fire-tv) for using [Radiant Media Player](https://www.radiantmediaplayer.com/) when building a Fire TV app. Similar to the Youtube/Brightcove projects it shows through a fully-fledged example how to use Radiant Media Player in the Web App Starter Kit. 

Scope of support:
- Fire TV devices with Fire OS 5+

Supported features:
- HLS and AES HLS streaming 
- MP4 progressive download 
- Live or on-demand video
- Video ads 
- Complete playlist example

Currently unsupported features:
- DRM
- VTT captions
- Multi-audio tracks
- 360 video

## Install
`git clone https://github.com/radiantmediaplayer/web-app-starter-kit-for-fire-tv.git`

`npm install`

`npm install -g serve`

## Gulp task
`gulp build`: build all the projects

`gulp watch`: useful for development

## Developing
The project including Radiant Media Player is located at src/projects/simple-rmp/.

To see it live run `serve -p 3000` and go to out/simple-rmp/. with your favorite browser.

Make changes while `gulp watch` is running and see them up when reloading.

Our main adaptation work is located in src/common/js/player-view-rmp.js. This is where you can fine tune player settings to fit your project requirement (see this.initPlayer function to understand how player settings are passed to the player).

You will need to use your Radiant Media Player license key (RMP Edition or PLATFORM Edition will work - see around line 297 in src/common/js/player-view-rmp.js) for the example to operate.

For debug logs go to around line 37 in src/common/js/player-view-rmp.js and set `this.debug = true;`.

Before going to production you will need to test your app with [the Amazon Web App Tester](https://developer.amazon.com/docs/html5-web-apps/webapp-app-tester.html) to insure it renders correctly on a Fire OS device.

## Required player settings
In order to fit the Fire TV app environment the following player settings are mandatory:
```javascript
hideControls: true,
autoplay: true,
googleCast: false,
disableKeyboardControl: true,
iframeMode: true,
iframeAllowed: true
```

## Video ads scope of support
We support using video ads in a Fire TV apps through our open source [rmp-vast](https://github.com/radiantmediaplayer/rmp-vast) parser. It should be noted that using the Google IMA SDK within a Fire TV is not an officially supported use-case by Google and while it remains technically possible to use it, it remains untested by Radiant Media Player team. 
Using ads from Google network (DFP, AdSense, AdX ...) generally requires using the IMA SDK and as such we cannot guarentee those ads will render correctly in a Fire TV app.


## Custom JSON for media data
In addition to data available in genericMediaData.json (see src/projects/simple/genericMediaData.json) we have added some fields to support Radiant Media Player advanced features. Those new fields are optional.
```json
"adTagUrl": "https://www.radiantmediaplayer.com/vast/tags/inline-linear-1.xml",
"live": true
```
See src/projects/simple-rmp/rmpMediaData.json for an example.
Those data relate to Radiant Media Player settings. See [Radiant Media Player docs](https://www.radiantmediaplayer.com/docs/latest/quick-start.html) for more info. 

Below is the README for the [Web App Starter Kit for Fire TV](https://github.com/amzn/web-app-starter-kit-for-fire-tv) repository.

-------------------
# Web App Starter Kit for Fire TV
-------------------

Welcome! This is the source repository for the Web App Starter Kit for Fire TV, a getting started kit for creating a video or media focused web app for Fire TV.

Amazon Fire TV includes Amazon WebView, an advanced Chromium-based web engine common to all Fire OS devices. This enables the Fire TV to use the latest HTML5 functionality such as GPU accelerated CSS3 transforms and a recent JavaScript engine.

We have created the Starter Kit to give web developers an easier entry into developing applications for Fire TV devices. The starter kit provides a minimal media app that uses the FireTV remote effectively and provides a user experience consistent with the rest of the device.  It can be used as-is, or as a structural piece of a richer app.

A live running example can be found at: [http://amzn.github.io/web-app-starter-kit-for-fire-tv](http://amzn.github.io/web-app-starter-kit-for-fire-tv/ "Live Template Example")

A zip file of the Starter Kit example projects can be found here:<br> [https://amzn.github.io/web-app-starter-kit-for-fire-tv/web-app-starter-kit-for-fire-tv-projects.zip](https://amzn.github.io/web-app-starter-kit-for-fire-tv/web-app-starter-kit-for-fire-tv-projects.zip "Downloadable Zip of Projects")


## Setup
-------------------

### Acquiring the source code
-------------------

Clone the repository to your local development environment.

		git clone https://github.com/amzn/web-app-starter-kit-for-fire-tv.git

### Setting up the test server
-------------------

Sample data has been included to get you started, but because the template uses XHR to retrieve JSON data, you will need to serve the files using an HTTP server locally for testing.  This can be done using a variety of methods, including using the command line and navigating to the `out/<project>` directory replacing <project> with an example project or your own project and running the following:

* Using Node and NPM, install the [Serve package](https://www.npmjs.org/package/serve), then create the server:

		sudo npm install -g serve
		serve -p 3000

Both of these methods should result in you being able to access the template in your browser or [Web App Tester](http://www.amazon.com/Amazon-Digital-Services-Inc-Tester/dp/B00DZ3I1W8) at `http://localhost:3000`.

### Setting up a test environment
-------------------

We recommend testing the template with Chrome when developing on a desktop computer.  While any browser should work except for Internet Explorer, the web view in FireTV is based on the Chromium project and Chrome offers excellent emulation and debugging support

The template is designed for a 1080p display, and will be most accurately viewed by using Chrome's emulation to specify the screen size. Insructions to enable this can be found here: [Device Mode & Mobile Emulation](https://developer.chrome.com/devtools/docs/device-mode) The resolution should be set to 1920x1080 and the Device Pixel Ratio should be 1. (Use "Shrink to fit" on smaller screens.)

To test this app on a FireTV device, please refer to the [Web App Tester](https://developer.amazon.com/public/solutions/platforms/webapps/docs/tester.html).

### Setup of the SASS script file
-------------------
The template uses SASS as its main source of CSS content. SASS is a language which compiles down to standard CSS. In the template, we have included a precompiled CSS file in the `/out/<project-name>` directory.

You're welcome to modify the CSS directly, but we recommend working with the SASS source instead. Please refer to the [SASS Install](http://sass-lang.com/install) link for more information on setting up SASS in your development environment. We have a build system which makes it easy to deal with SASS, for more information please refer to the [Building Document](./docs/building.md)

More information on the SASS structure please read the [Styling Document](./docs/styling.md)

## Customizing the template
-------------------
The source is released under the Creative Commons License, which allows developers to modify, customize, and release the template without any legal barriers. The HTML templates are contained in the `src/common/html/index.html` file and the SASS files are in the `src/common/scss/` directory. The scss files `firetv.scss` and `_variables.scss` allow you to easily modify commonly used look and feel aspects through Sass. For more information on styling the template read the [Styling Document](./docs/styling.md). We recommend creating a new project and utilizing the gulp build system. For more information see the [Building Document](./docs/building.md)


For information on developing using the template and modifying app functionality please refer to the [Architecture Overview](./docs/architecture.md).

The template supports a variety of platforms, data inputs, and media players, including MRSS, JSON, and YouTube. For information on these please refer to the [Architecture Overview](./docs/architecture.md) and the [Platform Documentation](./docs/platforms.md)

## More information
-------------------

For more information about developing web apps for Amazon devices, please see:

* [Amazon HTML5 Web Apps Developer Portal](https://developer.amazon.com/public/solutions/platforms/webapps)
* [Web App Tester](http://www.amazon.com/Amazon-Digital-Services-Inc-Tester/dp/B00DZ3I1W8)
* [Amazon Fire TV Developer Portal](https://developer.amazon.com/public/solutions/devices/fire-tv)


## Discussion
-------------------

If you have any questions, concerns or problems with the Fire TV Web App templates, please submit issues, or post a message on GitHub or to the [Amazon Developer Portal Forums](http://forums.developer.amazon.com/forums/category.jspa?categoryID=39).  Pull requests are also welcome.

## Release Notes
-------------------

v1.3 Release: Code cleanup, error handling added to players and models, UX touch ups and functionality tweaks.

Changes:

* Error handling added throughout the player and model code to notify end users about problems and log errors to console for developers.
* User Interface tweaks: Made drop shadows more consistent for when something is selected, and made button selection less ambiguous with borders.
* Fonts and styles have been updated to work more towards the same experience in the browser as the Fire TV.
* New live stream badging.

New Features:

* Brightcove Support: The Web App Starter Kit currently supports making a web app based on content from Brightcove¹s Video Cloud and uses the Brightcove Player to play the content. The provided sample project (`src/projects/brightcove`) supports analytics through Brightcove Video Cloud Analytics and advertising through the IMA3 Plugin. Read [brightcove.md](docs/brightcove.md) to learn more.
* Simulated fast forward and rewind - You can now skip repeatedly in videos, making long videos much easier to use.
* The Starter Kit also supports a category which can contain a one level deep hierarchy of playlists. This is called a multiPlaylists object which contains an array of playlist ids. These ids will be displayed as sub-categories. For details see [platforms.md](docs/platforms.md).

-----------
v1.2 Release: In addition to new features, we have made many tweaks to the user experience of the starter kit and added more robust support for our previous data sources.

Changes:

* The first category view/feed is the first view of the application. The left navigation view is hidden when the application is launched.
* Drop shadows have been added to image thumbnails, video stills, buttons and the menu to create an improved appearance.
* Fonts and styles have been made consistent through the application.
* Button placement has been changed for video contextual buttons to fit better with the title and description text.
* There is a new loading spinner to better match the FireTV Operating System.

New Features:

* In App Purchase Support - Now supports Amazon’s IAP v1 API for in app purchases, and has a sample application and documentation to demonstrate.
* Live Stream Support - Now supports Live Stream applications with HLS streams, with added support for live stream schedules.
* Subcategories - Template now supports subcategories within main categories to add hierarchy to applications.
* YouTube Sections Support - Developers can now create YouTube applications based on their YouTube sections they have defined on YouTube.com.
* YouTube Hierarchy Support - Template now supports categories of YouTube playlists, which creates subcategories of the videos in the playlist.
* Skip forward/backward amount can now be changed by the application settings.
* New alternative JSON Format - A new alternative JSON format for data has been added to create more control over what is placed in each category and where.

-----------
v1.1 Release: In addition to new features, the structure of the Starter Kit changed to better organize the sources, documentation and build directory.

Changes:

* Starter Kit version information has been added to index.html
* Source files have been reorganized and moved into the src/ directory
* A new Projects folder has been created in src/projects which contains several  example apps
* The Gulp build process has been streamlined, and now builds into an out/ directory.
* Documentation has been updated, and documents added for theming and platform support
* Bug fixes and code changes to support new features

New Features:

* Skip Indication icon - when a user presses right/left on the controller D-pad during playback
* Information panel - when a user presses up/down on the controller D-pad during playback
* Continuous Play - playback will now automatically continue to the next video in a category when finished
* Search - a new search field has been added to the categories list, with basic client-side filtering
* YouTube support - the template now has support for the YouTube data API and HTML5 player
* MediaRSS - the template now supports using MediaRSS as a data source
* Options for various features can be toggled using the init.js file
* A new Simple-Themes project was added with several examples themes

## License
-------------------
The template is released as open source under the Creative Commons License. For more information on this license please refer to the following link: [Creative Commons License CC0](http://creativecommons.org/publicdomain/zero/1.0/)

