QFirefoxMod
===


## How this Works
This script load QMod.jsm as a Firefox module and has access to all low levels apis so you can change basically anything on Firefox.

## Installation
    1. Copy `firefox` to firefox installation.
    2. Copy `chrome` to profile folder.
## Enable at about:config
    * `qmod`
    * `svg.context-properties.content.enabled`
    * `toolkit.legacyUserProfileCustomizations.stylesheets`
    * `gfx.vsync.force-disable-waitforvblank`
    * `layers.acceleration.force-enabled`
    * `gfx.webrender.all`


# Some configs

ui.systemUsesDarkTheme = 1

# Basic Files
* `userChrome.css`
    Modify Firefox user interface.

* `userContent.css`
    Modify all pages.


