import GLib from 'gi://GLib';
import Soup from 'gi://Soup';

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
        return `${Math.round(this.#data.main.temp)}°C`;
    }

    /**
     * Query the Weather API.
     * @param lat latitude to query for
     * @param lon longitude to query for
     * @param apiKey openweathermap.org API key
     * @param finalFunc optional function to call after the data is ready
     */
    query(lat, lon, apiKey, finalFunc = null) {
        const apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        const message = Soup.Message.new('GET', apiURL);
        // TODO Add API call counter
        this.#soupSession.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session, result) => {
                // TODO What if fails
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
     * Check that the object has weather data.
     * @returns True if has data from API
     */
    gotData() {
        return this.#data !== null;
    }

    // TODO Get current city

    // TODO Get weather description
}
