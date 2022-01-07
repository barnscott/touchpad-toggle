/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'touchpad-toggle';

const { GObject, St, Gio, Shell, Meta } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0);
        this._tpSettings = ExtensionUtils.getSettings('org.gnome.desktop.peripherals.touchpad');
        
        this.iconbin = new St.Bin();
        this.panelIcon;
        this._updateIcon();
		this.actor.add_child(this.iconbin);

        this.connect('button-press-event', () => {
            this._toggleTouchpad()
        });
    }

    _updateIcon(){
        log('_updateIcon().');
        var tpStatus = this._touchpadStatus();
        if(tpStatus == 'enabled'){
            this._enabledTouchpadIcon()
        }else{
            this._disabledTouchpadIcon()
        }
    }

    _toggleTouchpad(){
        log('_toggleTouchpad().');
        var tpStatus = this._touchpadStatus();
        if(tpStatus == 'enabled'){
            log('disable_touchpad');
            this._tpSettings.set_string('send-events', 'disabled');
            this._disabledTouchpadIcon();
        }else{
            log('enable_touchpad.');
            this._tpSettings.set_string('send-events', 'enabled');
            this._enabledTouchpadIcon();
        }
    }

    _touchpadStatus(){
        log('_touchpadStatus().');
        var tpStatus = this._tpSettings.get_string('send-events');
        return tpStatus;
    }

    _enabledTouchpadIcon(){
        log('_enabledTouchpadIcon().');
        this.panelIcon = new St.Icon({
            icon_name: 'input-touchpad-symbolic',
            style_class: 'system-status-icon',
            //style_class: "touchpad-icon"
        });
        this.iconbin.set_child(this.panelIcon);
    }

    _disabledTouchpadIcon(){
        log('_disabledTouchpadIcon().');
        this.panelIcon = new St.Icon({
            icon_name: 'touchpad-disabled-symbolic',
            style_class: 'system-status-icon',
            //style_class: "touchpad-icon-disabled"
        });
        this.iconbin.set_child(this.panelIcon);
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
