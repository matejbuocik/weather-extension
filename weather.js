import GLib from 'gi://GLib';
import Geoclue from 'gi://Geoclue';
import Soup from 'gi://Soup';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

/*
type WeatherAPIData = {
    weather: {
        id: number,         // Weather condition id
        main: string,       // Group of weather parameters (Rain, Snow, Clouds etc.)
        description: string,// Weather condition within the group
        icon: string,       // Weather icon id
    }[],
    main: {
        temp: number,       // Temperature, Metric: Celsius, Imperial: Fahrenheit
        feels_like: number, // What temperature it feels like, Metric: Celsius, Imperial: Fahrenheit
        temp_min: number,   // Minimum temperature at the moment
        temp_max: number,   // Maximum temperature at the moment
        pressure: number,   // Atmospheric pressure on the sea level, hPa
        humidity: number,   // Humidity, %
        sea_level: number,  // Atmospheric pressure on the sea level, hPa
        grnd_level: number, // Atmospheric pressure on the ground level, hPa
    },
    visibility: number,     //  Visibility, meter (max 10km)
    wind: {
        speed: number,      // Wind speed, Metric: meter/sec, Imperial: miles/hour
        deg: number,        // Wind direction, degrees (meteorological)
        gust: number,       // Wind gust, Metric: meter/sec, Imperial: miles/hour
    },
    clouds: {
        all: number,        // Cloudiness, %
    },
    rain?: {
        '1h': number,       // Rain volume for the last 1 hour, mm
        '3h': number,       // Rain volume for the last 3 hours, mm
    },
    snow?: {
        '1h': number,       // Snow volume for the last 1 hour, mm
        '3h': number,       // Snow volume for the last 3 hours, mm
    },
    dt: number,             // Time of data calculation, unix, UTC
    sys: {
        country: string,    // Country code
        sunrise: number,    // Sunrise time, unix, UTC
        sunset: number,     // Sunset time, unix, UTC
    },
    timezone: number,       // Shift in seconds from UTC
}
*/

export default class Weather {
    // TODO Show more of data
    #data = null;
    #soupSession = new Soup.Session();
    #WeatherTranslate = {
        'Clear': 'clear',
        'Clearnight': 'clear-night',

        'Clouds': 'overcast',
        'Cloudsnight': 'overcast',

        'Atmosphere': 'fog',
        'Atmospherenight': 'fog',

        'Snow': 'snow',
        'Snownight': 'snow',

        'Rain': 'showers',
        'Rainnight': 'showers',

        'Drizzle': 'showers-scattered',
        'Drizzlenight': 'showers-scattered',

        'Thunderstorm': 'storm',
        'Thunderstormnight': 'storm',

        'FewClouds': 'few-clouds',
        'FewCloudsnight': 'few-clouds-night',
        'Windy': 'windy',
        'Alert': 'severe-alert',
    };
    // TODO Get location from Geoclue
    #LAT = '49.199';
    #LON = '16.598';
    #KEY = '518220cbd973593ae8ea8dd3dd04f2f9';
    #API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${this.#LAT}&lon=${this.#LON}&appid=${this.#KEY}&units=metric`;

    /**
     * Get Gnome weather icon name.
     * @returns icon name to use in `new St.Icon`
     */
    iconStr() {
        // TODO Base also on weather ID
        let night = '';
        if (this.#data.dt > this.#data.sys.sunset || this.#data.dt < this.#data.sys.sunrise) {
            night = 'night';
        }

        const sky = this.#data.weather[0].main;
        const icon = this.#WeatherTranslate[`${sky}${night}`];

        return `weather-${icon}-symbolic`;
    }

    /**
     * Get current temperature.
     * @returns string of current temperature
     */
    temperatureStr() {
        return `${Math.round(this.#data.main.temp)} °C`;
    }

    /**
     * Query the Weather API.
     * @param finalFunc optional function to call after the data is ready
     */
    query(finalFunc = null) {
        // Main.notify(_('querying'));
        const message = Soup.Message.new('GET', this.#API_URL);
        this.#soupSession.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session, result) => {
                if (message.get_status() === Soup.Status.OK) {
                    const bytes = session.send_and_read_finish(result);
                    const decoder = new TextDecoder('utf-8');
                    const response = decoder.decode(bytes.get_data());
                    this.#data = JSON.parse(response);
                    finalFunc !== null && finalFunc();
                }
            }
        );
    }

    /**
     * Check that the object has weather #data.
     * @returns True if has data from API
     */
    gotData() {
        return this.#data !== null;
    }
}