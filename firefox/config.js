// Code needs to start on the second line 
// pref("qmod.version", "1.2");
const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cm = Components.manager;

try {
    Cu.import("resource://gre/modules/Services.jsm");
    // Cu.import("resource://gre/modules/osfile.jsm");

    if (!Services.appinfo.inSafeMode) {
        // Cu.import(OS.Path.toFileURI(OS.Constants.Path.profileDir) + '/chrome/qmod/boot.jsm');
        let cmanifest = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get('UChrm', Ci.nsIFile);
        cmanifest.append('qmod');
        cmanifest.append('chrome.manifest');
        Cm.QueryInterface(Ci.nsIComponentRegistrar).autoRegister(cmanifest);

        // ChromeUtils.import('chrome://qmod/content/QMod.jsm');
        // Cu.import('chrome://qmod/content/QMod.jsm');
        Cu.import('resource://qmod/QMod.jsm');
    };

} catch (e) {};

Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).invalidateCachesOnRestart();
