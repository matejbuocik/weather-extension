# weather@matejbuocik

Shows what's the weather like outside on the top panel.  
![screenshot](https://github.com/user-attachments/assets/2f07dc09-c709-4635-b7d4-c27a4096778c)

## Install
1. Clone the repo into `~/.local/share/gnome-shell/extensions/weather@matejbuocik`
2. On Wayland logout and log back in. On X11 press alt+f2, type r and enter.
3. `gnome-extensions enable weather@matejbuocik`

## Setup
To use Weather API an [OpenWeather API](https://openweathermap.org/api) key must be set in the extension's preferences.
The [free tier](https://openweathermap.org/price) allows for a million calls a month, or about 22 calls every minute. By default the extension queries the API every five minutes.
The key can be obtained for free by signing up [here](https://openweathermap.org/home/sign_up). It will be activated automatically, up to 2 hours after registration.
