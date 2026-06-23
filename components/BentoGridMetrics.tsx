import React from "react";
import { WeatherTheme } from "../utils/weatherUtils";
import {
  Wind,
  Droplets,
  Sun,
  Gauge,
  CloudRain,
  Navigation,
} from "lucide-react";

interface BentoGridMetricsProps {
  current: {
    humidity: number;
    uvIndex: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
  };
  currentHourPrecipProb: number;
  theme: WeatherTheme;
}

export default function BentoGridMetrics({
  current,
  currentHourPrecipProb,
  theme,
}: BentoGridMetricsProps) {
  // Helper to interpret UV index
  const getUVStatus = (uv: number) => {
    if (uv <= 2) return { label: "Faible", color: "text-emerald-400" };
    if (uv <= 5) return { label: "Modéré", color: "text-amber-400" };
    if (uv <= 7) return { label: "Élevé", color: "text-orange-400" };
    if (uv <= 10) return { label: "Très élevé", color: "text-red-400" };
    return { label: "Extrême", color: "text-purple-400" };
  };

  // Helper to calculate wind cardinal direction
  const getWindDirectionLabel = (degree: number) => {
    const directions = ["Nord", "Nord-Est", "Est", "Sud-Est", "Sud", "Sud-Ouest", "Ouest", "Nord-Ouest"];
    const index = Math.round((degree % 360) / 45) % 8;
    return directions[index];
  };

  // Helper to interpret humidity
  const getHumidityStatus = (humidity: number) => {
    if (humidity < 30) return "Air Sec";
    if (humidity <= 60) return "Confortable";
    return "Humide";
  };

  // Helper to interpret atmospheric pressure
  const getPressureStatus = (pressure: number) => {
    if (pressure > 1015) return "Haute pression";
    if (pressure < 1010) return "Basse pression";
    return "Normale";
  };

  const labelColor = "text-white/60";
  const valColor = "text-white";
  const descColor = "text-white/80";

  const uvStatus = getUVStatus(current.uvIndex);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* CARD 1: WIND (VENT) */}
      <div
        className={`p-5 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 ${theme.glowClass} glass-border-hover flex flex-col justify-between min-h-[160px]`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold flex items-center gap-2 ${labelColor}`}>
            <Wind className="w-4.5 h-4.5" /> Vent
          </span>
          <div className="relative w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
            {/* Wind vane rotating according to degrees */}
            <Navigation
              className={`w-4 h-4 transition-transform duration-500 ${theme.type === "sunny" ? "text-amber-400" : theme.type === "cloudy" ? "text-purple-300" : "text-cyan-400"}`}
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
          </div>
        </div>
        <div className="my-2">
          <span className={`text-3xl font-extrabold tracking-tight ${valColor}`}>
            {current.windSpeed}
          </span>
          <span className={`text-sm font-medium ml-1 ${labelColor}`}>km/h</span>
        </div>
        <div className={`text-xs ${descColor}`}>
          Direction : <span className="font-semibold">{getWindDirectionLabel(current.windDirection)}</span> ({current.windDirection}°)
        </div>
      </div>

      {/* CARD 2: UV INDEX */}
      <div
        className={`p-5 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 ${theme.glowClass} glass-border-hover flex flex-col justify-between min-h-[160px]`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold flex items-center gap-2 ${labelColor}`}>
            <Sun className="w-4.5 h-4.5" /> Index UV
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.accentBg} ${theme.accentText}`}>
            {current.uvIndex.toFixed(1)}
          </span>
        </div>
        <div className="my-2 flex flex-col gap-1">
          <span className={`text-3xl font-extrabold tracking-tight ${valColor}`}>
            {uvStatus.label}
          </span>
          {/* Progress bar representing UV risk */}
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                current.uvIndex <= 2
                  ? "bg-emerald-400"
                  : current.uvIndex <= 5
                  ? "bg-amber-400"
                  : current.uvIndex <= 7
                  ? "bg-orange-400"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min((current.uvIndex / 12) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className={`text-xs ${descColor}`}>
          Risque solaire estimé pour aujourd&apos;hui.
        </div>
      </div>

      {/* CARD 3: HUMIDITY */}
      <div
        className={`p-5 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 ${theme.glowClass} glass-border-hover flex flex-col justify-between min-h-[160px]`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold flex items-center gap-2 ${labelColor}`}>
            <Droplets className="w-4.5 h-4.5" /> Humidité
          </span>
        </div>
        <div className="my-2">
          <span className={`text-3xl font-extrabold tracking-tight ${valColor}`}>
            {current.humidity}
          </span>
          <span className={`text-sm font-medium ml-1 ${labelColor}`}>%</span>
        </div>
        <div className={`text-xs ${descColor}`}>
          Indice : <span className="font-semibold">{getHumidityStatus(current.humidity)}</span>
        </div>
      </div>

      {/* CARD 4: ATMOSPHERIC PRESSURE */}
      <div
        className={`p-5 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 ${theme.glowClass} glass-border-hover flex flex-col justify-between min-h-[160px]`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold flex items-center gap-2 ${labelColor}`}>
            <Gauge className="w-4.5 h-4.5" /> Pression
          </span>
        </div>
        <div className="my-2">
          <span className={`text-3xl font-extrabold tracking-tight ${valColor}`}>
            {Math.round(current.pressure)}
          </span>
          <span className={`text-sm font-medium ml-1 ${labelColor}`}>hPa</span>
        </div>
        <div className={`text-xs ${descColor}`}>
          Tendance : <span className="font-semibold">{getPressureStatus(current.pressure)}</span>
        </div>
      </div>

      {/* CARD 5: PRECIPITATION & PROBABILITY */}
      <div
        className={`p-5 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 ${theme.glowClass} glass-border-hover flex flex-col justify-between min-h-[160px] sm:col-span-2`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold flex items-center gap-2 ${labelColor}`}>
            <CloudRain className="w-4.5 h-4.5" /> Précipitations & Probabilité
          </span>
          {currentHourPrecipProb > 0 && (
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              💧 {currentHourPrecipProb}% de risque
            </span>
          )}
        </div>
        <div className="flex items-end justify-between my-2">
          <div>
            <span className={`text-3xl font-extrabold tracking-tight ${valColor}`}>
              {current.precipitation}
            </span>
            <span className={`text-sm font-medium ml-1 ${labelColor}`}>mm</span>
            <p className={`text-xs mt-1 ${descColor}`}>Quantité de pluie mesurée aujourd&apos;hui</p>
          </div>
          
          {/* Visual probability bar */}
          <div className="w-1/2 flex flex-col gap-1 items-end">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${labelColor}`}>Probabilité Actuelle</span>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${currentHourPrecipProb}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${theme.accentText}`}>
              {currentHourPrecipProb}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
