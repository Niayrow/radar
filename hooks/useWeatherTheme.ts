import { useMemo } from "react";
import { getWeatherTheme, WeatherTheme, themes } from "../utils/weatherUtils";

/**
 * React hook to retrieve the current dynamic weather theme based on code and temperature.
 * Falls back to a warm/mild sunny theme if inputs are undefined.
 */
export function useWeatherTheme(code: number | undefined, temp: number | undefined): WeatherTheme {
  return useMemo(() => {
    if (code === undefined || temp === undefined) {
      // Default fallback
      return themes.sunny;
    }
    return getWeatherTheme(code, temp);
  }, [code, temp]);
}
