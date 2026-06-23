import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  LucideIcon,
  HelpCircle
} from "lucide-react";

export type WeatherThemeType = "sunny" | "rain" | "cloudy" | "cold";

export interface WeatherData {
  timezone: string;
  elevation: number;
  current: {
    time: string;
    temperature: number;
    humidity: number;
    apparentTemperature: number;
    isDay: boolean;
    precipitation: number;
    weatherCode: number;
    cloudCover: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    uvIndex: number;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    humidity: number;
    apparentTemperature: number;
    precipitationProbability: number;
    precipitation: number;
    weatherCode: number;
    pressure: number;
    windSpeed: number;
    uvIndex: number;
  }>;
}

export interface WeatherTheme {
  type: WeatherThemeType;
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  accentText: string;
  accentBg: string;
  glowClass: string;
  name: string;
  blob1: string;
  blob2: string;
}

export interface WMOInfo {
  label: string;
  icon: LucideIcon;
  theme: WeatherThemeType;
}

// Full translation map of WMO Weather Interpretation Codes (WMO)
export const wmoMap: Record<number, WMOInfo> = {
  0: { label: "Ciel dégagé", icon: Sun, theme: "sunny" },
  1: { label: "Principalement dégagé", icon: SunDim, theme: "sunny" },
  2: { label: "Partiellement nuageux", icon: CloudSun, theme: "cloudy" },
  3: { label: "Couvert", icon: Cloud, theme: "cloudy" },
  45: { label: "Brouillard", icon: CloudFog, theme: "cloudy" },
  48: { label: "Brouillard givrant", icon: CloudFog, theme: "cloudy" },
  51: { label: "Bruine légère", icon: CloudDrizzle, theme: "rain" },
  53: { label: "Bruine modérée", icon: CloudDrizzle, theme: "rain" },
  55: { label: "Bruine dense", icon: CloudDrizzle, theme: "rain" },
  56: { label: "Bruine verglaçante légère", icon: CloudDrizzle, theme: "rain" },
  57: { label: "Bruine verglaçante dense", icon: CloudDrizzle, theme: "rain" },
  61: { label: "Pluie légère", icon: CloudRain, theme: "rain" },
  63: { label: "Pluie modérée", icon: CloudRain, theme: "rain" },
  65: { label: "Pluie forte", icon: CloudRainWind, theme: "rain" },
  66: { label: "Pluie verglaçante légère", icon: CloudSnow, theme: "cold" },
  67: { label: "Pluie verglaçante forte", icon: CloudSnow, theme: "cold" },
  71: { label: "Neige légère", icon: Snowflake, theme: "cold" },
  73: { label: "Neige modérée", icon: Snowflake, theme: "cold" },
  75: { label: "Neige forte", icon: Snowflake, theme: "cold" },
  77: { label: "Grains de neige", icon: Snowflake, theme: "cold" },
  80: { label: "Averses de pluie légères", icon: CloudRain, theme: "rain" },
  81: { label: "Averses de pluie modérées", icon: CloudRain, theme: "rain" },
  82: { label: "Averses de pluie violentes", icon: CloudRainWind, theme: "rain" },
  85: { label: "Averses de neige légères", icon: CloudSnow, theme: "cold" },
  86: { label: "Averses de neige fortes", icon: CloudSnow, theme: "cold" },
  95: { label: "Orage", icon: CloudLightning, theme: "rain" },
  96: { label: "Orage avec grêle légère", icon: CloudLightning, theme: "rain" },
  99: { label: "Orage avec grêle forte", icon: CloudLightning, theme: "rain" },
};

export const themes: Record<WeatherThemeType, WeatherTheme> = {
  // ☀️  SUNNY — hot coral-orange to deep violet
  sunny: {
    type: "sunny",
    bgGradient: "from-[#ff6b00] via-[#ee0979] to-[#7b2ff7]",
    cardBg: "bg-black/30 backdrop-blur-2xl",
    cardBorder: "glass-card-sunny",
    textColor: "text-white",
    accentText: "text-orange-300",
    accentBg: "bg-gradient-to-br from-orange-500/25 to-rose-500/20",
    glowClass: "shadow-[0_0_60px_rgba(238,9,121,0.40)]",
    name: "Grand Soleil / Chaud",
    blob1: "bg-orange-500",
    blob2: "bg-fuchsia-600",
  },

  // 🌧  RAIN — midnight indigo to electric teal
  rain: {
    type: "rain",
    bgGradient: "from-[#0a0a23] via-[#0f3460] to-[#0e7490]",
    cardBg: "bg-slate-950/45 backdrop-blur-2xl",
    cardBorder: "glass-card-rain",
    textColor: "text-cyan-50",
    accentText: "text-cyan-300",
    accentBg: "bg-gradient-to-br from-cyan-500/25 to-blue-600/20",
    glowClass: "shadow-[0_0_60px_rgba(6,182,212,0.38)]",
    name: "Pluie / Orage",
    blob1: "bg-blue-700",
    blob2: "bg-cyan-400",
  },

  // ☁️  CLOUDY — deep violet to warm fuchsia
  cloudy: {
    type: "cloudy",
    bgGradient: "from-[#1a0533] via-[#4a1d96] to-[#be185d]",
    cardBg: "bg-violet-950/40 backdrop-blur-2xl",
    cardBorder: "glass-card-cloudy",
    textColor: "text-white",
    accentText: "text-fuchsia-300",
    accentBg: "bg-gradient-to-br from-violet-500/25 to-fuchsia-500/20",
    glowClass: "shadow-[0_0_60px_rgba(168,85,247,0.38)]",
    name: "Nuageux / Brume",
    blob1: "bg-violet-600",
    blob2: "bg-pink-500",
  },

  // ❄️  COLD — dark navy to arctic teal
  cold: {
    type: "cold",
    bgGradient: "from-[#020b18] via-[#0c2a4a] to-[#0891b2]",
    cardBg: "bg-sky-950/40 backdrop-blur-2xl",
    cardBorder: "glass-card-cold",
    textColor: "text-white",
    accentText: "text-sky-300",
    accentBg: "bg-gradient-to-br from-sky-500/25 to-teal-500/20",
    glowClass: "shadow-[0_0_60px_rgba(14,165,233,0.40)]",
    name: "Froid Polaire",
    blob1: "bg-sky-500",
    blob2: "bg-teal-400",
  },
};

/**
 * Returns weather info for a given WMO code
 */
export function getWMOInfo(code: number): WMOInfo {
  return wmoMap[code] || { label: "Météo inconnue", icon: HelpCircle, theme: "sunny" };
}

/**
 * Determines the dynamic theme based on WMO code and current temperature.
 */
export function getWeatherTheme(code: number, temp: number): WeatherTheme {
  // If temp is freezing cold (< 3°C), force the cold theme
  if (temp < 3) {
    return themes.cold;
  }
  
  // If temperature is high (> 25°C), force the sunny/warm theme
  if (temp > 25) {
    return themes.sunny;
  }

  // Otherwise, use the mapped WMO theme
  const info = getWMOInfo(code);
  return themes[info.theme];
}

export interface DailyForecast {
  date: string;
  dayLabel: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
}

export function getDailyForecasts(hourly: WeatherData["hourly"]): DailyForecast[] {
  const daysMap: Record<string, typeof hourly> = {};
  
  hourly.forEach((item) => {
    const dateStr = item.time.split("T")[0];
    if (!daysMap[dateStr]) {
      daysMap[dateStr] = [];
    }
    daysMap[dateStr].push(item);
  });
  
  const daysKeys = Object.keys(daysMap).sort();
  
  return daysKeys.slice(0, 10).map((dateKey) => {
    const dayData = daysMap[dateKey];
    const temps = dayData.map((d) => d.temperature);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    
    // Find weather code at 12:00 or fallback to middle of day
    const noonItem = dayData.find((d) => d.time.includes("T12:00")) || dayData[Math.floor(dayData.length / 2)];
    const weatherCode = noonItem ? noonItem.weatherCode : 0;
    
    const windSpeed = noonItem ? noonItem.windSpeed : 10;
    const windDirection = noonItem ? (Math.round(noonItem.windSpeed * 15) % 360) : 0;
    
    const dateObj = new Date(dateKey + "T00:00:00");
    const dayLabel = dateObj.toLocaleDateString("fr-FR", { weekday: "short" });
    // Capitalize first letter and strip dot/format nicely
    const formattedLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1).replace(".", "");

    return {
      date: dateKey,
      dayLabel: formattedLabel,
      maxTemp,
      minTemp,
      weatherCode,
      windSpeed,
      windDirection,
    };
  });
}
