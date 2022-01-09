# Notes

The intent of this extension is to:

- provide a Gnome panel-icon that displays the touchpad status
- if user clicks the panel-icon, extension will verify if screen is in landscape or portrait orientations. if the display is in portrait, the touchpad will be disabled. if the display is in landscape, the touchpad will be enabled. 
- whenever the extention modify's the touchpad status, it inversly modifies the Screen Keyboard. therefore, user can modify the touchpad status also by disabling/enabling the the Screen Keyboard from the Accessibility Menu


org.gnome.desktop.peripherals.touchpad send-events

# Install

ln -s $PWD/touchpad-toggle@barnix.io ~/.local/share/gnome-shell/extensions/touchpad-toggle@barnix.io