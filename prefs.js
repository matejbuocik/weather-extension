import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class ExamplePreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    window._settings = settings;

    const builder = new Gtk.Builder();
    builder.add_from_file(this.path + '/prefs.ui.xml');
    const page = builder.get_object('preferences-page');
    window.add(page)

    const position = builder.get_object('position-in-panel');
    settings.bind('position-in-panel', position, 'selected',
      Gio.SettingsBindFlags.DEFAULT);

    // TODO Weather API Key
  }
}
