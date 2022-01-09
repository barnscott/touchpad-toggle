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

const { GObject, St, Gio, Shell, Meta, Clutter } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const display = global.display;
// const workspaceManager = global.workspace_manager;

const _ = ExtensionUtils.gettext;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0);
        this._tpSettings = ExtensionUtils.getSettings('org.gnome.desktop.peripherals.touchpad');
        this.tpdKey = 'send-events';
        this._vKeyboardSettings = ExtensionUtils.getSettings('org.gnome.desktop.a11y.applications');
        this.skKey = 'screen-keyboard-enabled';

        this.iconbin = new St.Bin({
            can_focus: true
        });
        this.panelIcon;
        this._updateIcon();
		this.actor.add_child(this.iconbin);//shows error in log at init time

        // when mouse-click/touch panel-icon, check orientation
        // and update touchpad appropriatly
        this.connect('button-press-event',() => this._evalOrientationForTouchpad());
        this.connect('touch-event',() => this._evalOrientationForTouchpad());

        // when touchpad is overriden by external event, update panel-icon
        this._tpSettings.connect(`changed::send-events`,() => this._updateIcon());
        
        // if screen-keyboard is enabled/disabled, then touchpad should be inversly affected
        this._vKeyboardSettings.connect(`changed::screen-keyboard-enabled`,() => this._skChange());

        let seat = null;
        //let originalGetTouchMode = null;
        seat = Clutter.get_default_backend().get_default_seat();
        //originalGetTouchMode = seat.get_touch_mode;
        seat.get_touch_mode = () => true;

    }

    _touchpadStatus(){
        log('_touchpadStatus().');
        var tpStatus = this._tpSettings.get_string(this.tpdKey);
        return tpStatus;
    }

    _skChange(){
        log('_skChange().');
        var tpStatus = this._vKeyboardSettings.get_boolean(this.skKey);
        if(tpStatus == true){
            this._disableTouchpad();
        }else{
            this._enableTouchpad();
        }
    }

    _updateIcon(){
        log('_updateIcon().');
        var tpStatus = this._touchpadStatus();
        if(tpStatus == 'enabled'){
            this._enabledTouchpadIcon();
        }else{
            this._disabledTouchpadIcon();
        }
    }

    _toggleTouchpad(){
        log('_toggleTouchpad().');
        var tpStatus = this._touchpadStatus();
        if(tpStatus == 'enabled'){
            log('disable_touchpad');
            this._disableTouchpad();
        }else{
            log('enable_touchpad.');
            this._enableTouchpad();
        }
    }

    _enableTouchpad(){
        this._tpSettings.set_string(this.tpdKey, 'enabled');
        this._enabledTouchpadIcon();
        this._vKeyboardSettings.set_boolean(this.skKey, false);//disable Screen-Keyboard
    }
    _disableTouchpad(){
        this._tpSettings.set_string(this.tpdKey, 'disabled');
        this._disabledTouchpadIcon();
        this._vKeyboardSettings.set_boolean(this.skKey, true);//enable Screen-Keyboard
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

    _evalOrientationForTouchpad(){
        this.mySize = display.get_size();
        var width = this.mySize[0];
        var height = this.mySize[1];
        if( width > height){
            log(`width ${width} > height ${height}`)
            this._enableTouchpad();
        }else{
            log(`width ${width} < height ${height}`)
            this._disableTouchpad();
        }
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
