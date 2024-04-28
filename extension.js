import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import Weather from './weather.js';

const WeatherIndicator = GObject.registerClass({
    GTypeName: 'WeatherIndicator',
}, class WeatherIndicator extends PanelMenu.Button {
    _init(extensionObject) {
        super._init(0.0, _('Weather'));

        this._extensionObject = extensionObject;
        this._settings = extensionObject.getSettings();

        this._menuLayout = new St.BoxLayout({
            vertical: false,
            clip_to_allocation: true,
            x_align: Clutter.ActorAlign.START,
            y_align: Clutter.ActorAlign.CENTER,
            reactive: true,
            x_expand: true,
            pack_start: false
        });
        this.add_child(this._menuLayout);
        this._icon = null;
        this._tempLabel = null;

        this._weather = new Weather();
        this._weatherTimer = null;

        this.draw();
        this._initializeMenu();
        this._weather.query(() => this.draw());
        this._initializeWeatherTimer();
    }

    draw() {
        // Destroy everything drawn, so this can be called on redraw
        this._icon?.destroy();
        this._tempLabel?.destroy();

        let icon = null;
        let tempLabel = null;

        if (!this._weather.gotData()) {
            icon = new St.Icon({
                iconName: 'weather-overcast-symbolic',
                styleClass: 'system-status-icon',
            });

            tempLabel = new St.Label({
                styleClass: 'weather-panel-label',
                text: '...°C',
                yExpand: true,
                xExpand: true,
                yAlign: Clutter.ActorAlign.CENTER,
            });
            return;
        } else {
            icon = new St.Icon({
                icon_name: this._weather.iconStr(),
                style_class: 'system-status-icon',
            });

            tempLabel = new St.Label({
                style_class: 'weather-panel-label',
                text: this._weather.temperatureStr(),
                y_expand: true,
                x_expand: true,
                y_align: Clutter.ActorAlign.CENTER,
            });
        }

        this._icon = icon;
        this._menuLayout.add_child(icon);
        this._tempLabel = tempLabel;
        this._menuLayout.add_child(tempLabel);
    }

    _initializeMenu() {
        // TODO Implement preferences
        const preferences = new PopupMenu.PopupMenuItem(_('Preferences'));
        preferences.connect('activate', () => {
            this.menu._getTopMenu().close();
            this._extensionObject.openPreferences();
        });
        this.menu.addMenuItem(preferences);
    }

    _initializeWeatherTimer() {
        const updateTime = this._settings.get_int('update-time');
        this._weatherTimer = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            updateTime,
            () => {
                this._weather.query(() => this.draw());
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _destroyTimer() {
        if (this._weatherTimer !== null) {
            GLib.Source.remove(this._weatherTimer);
            this._weatherTimer = null;
        }
    }

    destroy() {
        this._destroyTimer();
        super.destroy();
    }
});

export default class WeatherExtension extends Extension {
    enable() {
        this._weatherIndicator = new WeatherIndicator(this);
        Main.panel.addToStatusArea(this.uuid, this._weatherIndicator);
    }

    disable() {
        this._weatherIndicator.destroy();
        this._weatherIndicator = null;
    }
}
