qmod.widgets.menu = {
    // Config
    MENU_ID: 'qmod-menu',
    MENU_NAME: 'QMod',

    STYLE: {
        url: Services.io.newURI('data:text/css;charset=UTF-8,' + encodeURIComponent(`
        #qmod-menu .toolbarbutton-icon {
            list-style-image: url("resource://qmod/q.svg");
            transform: scaleX(1);
        }
        `)),
        type: qmod.sss.USER_SHEET,
    },

    init: function() {
        const { CustomizableUI } = window;
        const _this = this;

        CustomizableUI.createWidget({
            id: this.MENU_ID,
            type: 'custom',
            label: 'ok1', // button title
            tooltiptext: 'ok2', // tooltip title
            defaultArea: CustomizableUI.AREA_NAVBAR,
            removable: true,
            onBuild: function(doc) {
                let btn = qmod.createElement(doc, 'toolbarbutton', {
                    id: _this.MENU_ID,
                    label: _this.MENU_NAME,
                    tooltiptext: _this.MENU_NAME,
                    defaultArea: CustomizableUI.AREA_NAVBAR,
                    removable: true,
                    type: 'menu',
                    class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                    image: 'resource://qmod/q.svg',
                });

                let mp = qmod.createElement(doc, 'menupopup', {
                    id: 'qmod-button-popup',
                    onclick: function() {
                        event.preventDefault();
                        event.stopPropagation();
                    },
                });
                btn.appendChild(mp);

                _this._populate_menu(mp, doc);
                // Repopulate menu every time its opens.
                // mp.addEventListener('popupshowing', (e) => {
                // _this._populate_menu(mp, doc);
                // });

                return btn;
            }
        });



        // Set CSS 
        qmod.sss.loadAndRegisterSheet(this.STYLE.url, this.STYLE.type);
    },

    _populate_menu: function(mp, doc) {
        while (mp.firstChild) {
            mp.firstChild.remove();
        }

        let version = qmod.createElement(doc, 'menuitem', {
            label: `QMod ${qmod.VERSION}`,
            tooltiptext: `QMod ${qmod.VERSION}`,
            class: 'menuitem',
            disabled: true,
        });
        mp.append(version);

        mp.append(doc.createXULElement('menuseparator'))

        let reload = qmod.createElement(doc, 'menuitem', {
            label: 'Reload',
            tooltiptext: 'Reload',
            class: 'menuitem-iconic',
            disabled: false,
            image: 'chrome://global/skin/icons/reload.svg',
        });
        reload.onclick = function() {
            qmod.loadScripts(true);
        };
        mp.append(reload);

        let mi = qmod.createElement(doc, 'menuitem', {
            label: qmod.enabled ? ' Disable' : 'Enable',
            tooltiptext: qmod.enabled ? ' Disable' : 'Enable',
            class: 'menuitem-iconic',
            disabled: false,
            image: 'chrome://global/skin/icons/reload.svg',
        });
        mi.onclick = function(e) {
            qmod.toggle();
            let msg = qmod.enabled ? ' Disable' : 'Enable';
            this.setAttribute('label', msg);
            this.setAttribute('tooltiptext', msg);
        };
        mp.append(mi);

        // Styles menu
        this._create_styles_menu(mp, doc);

        // mp.append(doc.createXULElement('menuseparator'));

        // let sub_menu = qmod.createElement(doc, 'menu', {
        //     id: 'qmod-menu2',
        //     container: true,
        //     label: 'ok1'
        // });
        // mp.appendChild(sub_menu);

        // let menupopup = qmod.createElement(doc, 'menupopup', {
        //     id: 'qmod-submenu'
        // });
        // sub_menu.appendChild(menupopup);

        // let mi2 = qmod.createElement(doc, 'menuitem', {
        //     label: qmod.enabled ? ' Disable' : 'Enable',
        //     tooltiptext: qmod.enabled ? ' Disable' : 'Enable',
        //     class: 'menuitem-iconic',
        //     disabled: false,
        //     image: 'chrome://global/skin/icons/reload.svg',
        // });
        // mi2.onclick = function() {
        //     qmod.toggle();
        //     let msg = qmod.enabled ? ' Disable' : 'Enable';
        //     this.setAttribute('label', msg);
        //     this.setAttribute('tooltiptext', msg);
        // };
        // menupopup.append(mi2);

    },
    _create_styles_menu: function(mp, doc) {
        mp.append(doc.createXULElement('menuseparator'));

        let menu = qmod.createElement(doc, 'menu', {
            id: 'qmod-styles-menu',
            container: true,
            label: 'Styles'
        });
        mp.appendChild(menu);

        let styles_popup = qmod.createElement(doc, 'menupopup', {
            id: 'qmod-styles-submenupopup'
        });
        menu.appendChild(styles_popup);

        qmod.files.forEach((item, name) => {
            console.log(item);
            if (name.endsWith('.css')) {
                let label = `${item.name} | Loaded: ${item.loaded} `;
                let menuitem = qmod.createElement(doc, 'menuitem', {
                    label: label,
                    tooltiptext: label,
                    class: 'menuitem',
                    disabled: false,
                });
                styles_popup.append(menuitem);
            }
        });
    },

    destroy: function() {
        Services.wm.getMostRecentBrowserWindow().CustomizableUI.destroyWidget(this.MENU_ID);
        qmod.sss.unregisterSheet(this.STYLE.url, this.STYLE.type);
    }

};

qmod.widgets.menu.init();