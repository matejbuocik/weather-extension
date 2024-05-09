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

    const apiKey = builder.get_object('api-key');
    const currentKey = settings.get_string('api-key')
    apiKey.set_text(currentKey)
    apiKey.connect('apply', (widget) => {
      const text = widget.get_text();
      if (text && text !== currentKey) {
        settings.set_string('api-key', text);
      }
    });
  }
}
