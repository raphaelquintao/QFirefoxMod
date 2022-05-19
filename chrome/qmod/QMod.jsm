let EXPORTED_SYMBOLS = ['qmod'];

const { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm');
const { Management } = ChromeUtils.import('resource://gre/modules/Extension.jsm');
const { AppConstants } = ChromeUtils.import('resource://gre/modules/AppConstants.jsm');

function qlog() {
    console.info(...arguments);
}

var qmod = {
    // Constants
    VERSION: 1.27,
    PATH: {
        main_resource: 'resource://qmod',
        scripts: 'scripts',
        widgets: 'widgets'
    },
    FILES_TO_LOAD: ['uc.css', 'as.css', 'uc.js'],

    enabled: Services.prefs.getBoolPref("qmod", false),

    sss: Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService),

    files: new Map(),
    widgets: {},

    _load_scripts: function(list, path) {
        while (list.hasMoreElements()) {
            let file = list.getNext().QueryInterface(Ci.nsIFile);
            // let fileUri = Services.io.newFileURI(file);
            let fileUri = Services.io.newURI(`${this.PATH.main_resource}/${path}/${file.leafName}`);
            if (file.isFile()) {
                let tmp = {};
                if (/(^userChrome.+|\.uc)\.js$/i.test(file.leafName)) {
                    tmp = { 'type': 'uc.js', 'fileUri': fileUri, "loaded": false, 'name': file.leafName };
                } else if (/(^userChrome|\.uc)\.xul$/i.test(file.leafName)) {
                    tmp = { 'type': 'uc.xul', 'fileUri': fileUri, "loaded": false, 'name': file.leafNamem, };
                } else if (/\.as\.css$/i.test(file.leafName)) {
                    let loaded = (this.sss.sheetRegistered(fileUri, this.sss.AGENT_SHEET));
                    tmp = { 'type': 'as.css', 'fileUri': fileUri, "loaded": loaded, 'name': file.leafName };
                } else if (/\.uc\.css$/i.test(file.leafName)) {
                    let loaded = (this.sss.sheetRegistered(fileUri, this.sss.USER_SHEET));
                    tmp = { 'type': 'uc.css', 'fileUri': fileUri, "loaded": loaded, 'name': file.leafName };
                } else if (/^userChrome\.css$/i.test(file.leafName)) {
                    let loaded = (this.sss.sheetRegistered(fileUri, this.sss.USER_SHEET));
                    tmp = { 'type': 'userChrome.css', 'fileUri': fileUri, "loaded": loaded, 'name': file.leafName };
                } else if (/^userContent\.css$/i.test(file.leafName)) {
                    let loaded = (this.sss.sheetRegistered(fileUri, this.sss.USER_SHEET));
                    tmp = { 'type': 'userContent.css', 'fileUri': fileUri, "loaded": loaded, 'name': file.leafName };
                } else if (/^(?!(userChrome|userContent)\.css$).+\.css$/i.test(file.leafName)) {
                    let loaded = (this.sss.sheetRegistered(fileUri, this.sss.USER_SHEET));
                    tmp = { 'type': 'other.css', 'fileUri': fileUri, "loaded": loaded, 'name': file.leafName };
                } else continue;

                tmp.registerFile = (reload = false) => qmod._register_file(tmp, reload);
                tmp.unregisterFile = () => qmod._unregister_file(tmp);
                tmp.isRegistered = () => qmod._is_registered(tmp);

                // if (!this.files.has(file.leafName)) 
                this.files.set(file.leafName, tmp);
            }
        }
    },
    getFiles: function() {
        const dir = this.chrome_dir;
        dir.append('qmod');
        dir.append(this.PATH.scripts);
        let scripts_list = dir.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);

        this._load_scripts(scripts_list, this.PATH.scripts);

        const dir2 = this.chrome_dir;
        dir2.append('qmod');
        dir2.append(this.PATH.widgets);
        let widgets_list = dir2.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);

        this._load_scripts(widgets_list, this.PATH.widgets);

        return this;
    },
    loadScripts: function(reload = false, types = this.FILES_TO_LOAD) {
        console.info("%cQMod - Loading Scripts...", 'color: #eaabe4; font-weight:bold;');
        this.files.forEach((v, name) => {
            if (types.includes(v.type)) {
                if (this.enabled || (!this.enabled && v.type == 'uc.js'))
                    v.registerFile(reload);

            }
        });
    },
    unloadStyles: function() {
        console.info("%cQMod - Unloading CSS", 'color: #eaabe4; font-weight:bold;');
        this.files.forEach((v, name) => {
            if (v.type.endsWith("css"))
                v.unregisterFile();
        });
    },
    info: function(full = false) {
        console.info("%cQMod - Info", 'color: #eaabe4; font-weight:bold;');
        this.files.forEach((v, name) => {
            let status = (v.loaded) ? 'color:Gold;' : 'color:indianred;';
            if (full) console.info(`%c${name}%c | %c${v.fileUri.spec}%c | ${v.type} | %cLoaded: %c${v.loaded}`, 'color:lightpink;', '', 'color:grey', '', status);
            else console.info(`%c${name}%c | ${v.type} | %cLoaded: %c${v.loaded}`, 'color:lightpink;', 'color:grey', '', status);
            // console.groupCollapsed(`%c${name}%c | ${v.type} | %cLoaded: %c${v.loaded}`, 'color:lightpink;', 'color:grey', '', status);
            // console.info(v);
            // console.groupEnd();
        });
    },
    _is_registered: function(file) {
        if (file.type.endsWith("css")) {
            let agent = (file.type == "as.css") ? this.sss.AGENT_SHEET : this.sss.USER_SHEET;
            file.loaded = this.sss.sheetRegistered(file.fileUri, agent);
        }
        return file.loaded;
    },
    _register_file: function(file, reload) {
        if (file.type.endsWith("css")) {
            let agent = (file.type == "as.css") ? this.sss.AGENT_SHEET : this.sss.USER_SHEET;
            if (reload && this.sss.sheetRegistered(file.fileUri, agent)) this.sss.unregisterSheet(file.fileUri, agent);
            if (reload || !this.sss.sheetRegistered(file.fileUri, agent)) {
                this.sss.loadAndRegisterSheet(file.fileUri, agent);
                file.loaded = true;
                console.info("QMod - Loaded:", file.name);
                return true;
            } else console.info("QMod - Already Loaded:", file.name);
        } else if (file.type == 'uc.js') {
            let windows = Services.wm.getEnumerator('navigator:browser');
            while (windows.hasMoreElements()) {
                let win = windows.getNext();
                if (!win.qmod) continue;
                try {
                    if (!file.loaded) {
                        // Services.scriptloader.loadSubScript(file.fileUri.spec, win, "UTF-8");
                        Services.scriptloader.loadSubScriptWithOptions(file.fileUri.spec, { target: win, ignoreCache: true });
                        file.loaded = true;
                        console.info(`QMod - Loaded: ${file.name} for ${win.location}`, );
                    } else console.info(`QMod - Already Loaded: ${file.name} for ${win.location}`, );
                } catch (ex) {
                    console.info(`QMod - Failed to Load script: ${file.name} for ${win.location}`, ex);
                    // console.groupCollapsed("QMod - Failed to Load script: ", file.name);
                    // console.info(ex);
                    // console.groupEnd();
                }
                return true;
            }
        } else {
            console.info("QMod - Unsuported:", file.name);
        }
        return false;
    },
    _unregister_file: function(file) {
        if (file.type.endsWith("css")) {
            let agent = (file.type == "as.css") ? this.sss.AGENT_SHEET : this.sss.USER_SHEET;
            if (this.sss.sheetRegistered(file.fileUri, agent)) {
                this.sss.unregisterSheet(file.fileUri, agent);
                file.loaded = false;
                console.info("QMod - Removed:", file.name);
                return true;
            } else console.info("QMod - Not Registered:", file.name);
        } else {
            console.info("QMod - Unsuported:", file.name);
        }
        return false;
    },
    toggle: function() {
        Services.prefs.setBoolPref("qmod", !this.enabled)
        if (!this.enabled) this.unloadStyles()
        else this.loadScripts()
    },
    test: function(data = '') {
        Services.obs.notifyObservers(null, 'qmod:test', data);
    },
    createElement: function(doc, tag, atts, XUL = true) {
        let el = XUL ? doc.createXULElement(tag) : doc.createElement(tag);
        for (let att in atts) {
            el.setAttribute(att, atts[att]);
        }
        return el
    }
}

Object.defineProperties(qmod, {
  chrome_dir: {
    get: function(){
        return Services.dirsvc.get("UChrm", Ci.nsIFile);
    }
  }
});




// -- Handling Notifications --

let preference_observer = function(aSubject, aTopic, prefPath) {
    if (prefPath == 'qmod') {
        qmod.enabled = Services.prefs.getBoolPref("qmod", false);
        console.info("QMod Enabled:", qmod.enabled);
    }
}

let observer = {
    observe: function(aSubject, aTopic, aData) {
        qlog(`%cQMod - Event: ${aTopic}`, 'color: #DC72D2; font-weight:bold;');

        if (aTopic == 'chrome-document-global-created') {
            qmod.loadScripts();
            aSubject.addEventListener('DOMContentLoaded', this, { once: true });
        }
    },
    handleEvent: function(aEvent) {
        let document = aEvent.originalTarget;
        let window = document.defaultView;
        let location = window.location;
        window.qmod = qmod;

        console.info(`%cQMod - DOMContentLoaded: ${location}`, 'color: #eaabe4; font-weight:bold;');
    },
    messageListener: function(msg) {

    }
}

if (!Services.appinfo.inSafeMode) {
    qmod.getFiles();
    Services.obs.addObserver(observer, 'chrome-document-global-created', false);
    // Services.obs.addObserver(observer, 'final-ui-startup', false);
    // Services.obs.addObserver(observer, 'domwindowopened', false);
    Services.prefs.addObserver('qmod', preference_observer);
}