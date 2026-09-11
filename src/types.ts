export interface DailyForecast {
  time: string;
  maxTemp: number;
  minTemp: number;
  pressure: number;
  precipProb: number;
  weatherCode: number;
  painRisk: number;
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  weatherCode: number;
  painRisk: number;
  impactReason: string;
}

export interface HourlyForecast {
  time: string;
  pressure: number;
}

export interface AppData {
  city: string;
  lat: number;
  lon: number;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}
