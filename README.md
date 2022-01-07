# Notes

The intent of this extension is to:

- provide a Gnome panel icon-button that user can click on the Panel icon to enable/disable the touchpad
- automatically disable the touchpad when display if not in regular "landscape" orientation, and sync panel-icon accordingly


org.gnome.desktop.peripherals.touchpad send-events

# Install

ln -s $PWD/touchpad-toggle@barnix.io ~/.local/share/gnome-shell/extensions/touchpad-toggle@barnix.io