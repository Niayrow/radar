import React from "react";
import { getWMOInfo, getDailyForecasts, WeatherTheme, WeatherData } from "../utils/weatherUtils";
import { Calendar, Navigation } from "lucide-react";
import { motion } from "framer-motion";

interface DailyForecastsListProps {
  hourly: WeatherData["hourly"];
  theme: WeatherTheme;
  selectedDayDate: string | null;
  onSelectDay: (date: string) => void;
}

export default function DailyForecastsList({
  hourly,
  theme,
  selectedDayDate,
  onSelectDay,
}: DailyForecastsListProps) {
  const dailyData = getDailyForecasts(hourly);

  return (
    <div className={`p-5 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 ${theme.glowClass} glass-border-hover`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Prévisions sur 10 jours
        </h3>
        <Calendar className={`w-5 h-5 ${theme.accentText}`} />
      </div>

      <div className="flex flex-col gap-1.5">
        {dailyData.map((day, index) => {
          const wmo = getWMOInfo(day.weatherCode);
          const Icon = wmo.icon;
          const isSelected = day.date === selectedDayDate;

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelectDay(day.date)}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5 active:scale-98 ${
                isSelected
                  ? "bg-white/15 border border-white/20 shadow-[0_4px_12px_rgba(255,255,255,0.05)] scale-[1.01]"
                  : "border border-transparent"
              }`}
            >
              {/* Day Name */}
              <span className="text-sm font-semibold text-white/90 w-12">
                {day.dayLabel}
              </span>

              {/* Weather Icon */}
              <div className="flex items-center justify-center w-10">
                <Icon className={`w-6 h-6 ${theme.accentText} drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
              </div>

              {/* Temperatures */}
              <div className="flex items-center gap-3 w-24 justify-end">
                <span className="text-sm font-extrabold text-white">
                  {Math.round(day.maxTemp)}°C
                </span>
                <span className="text-xs font-semibold text-white/50">
                  {Math.round(day.minTemp)}°C
                </span>
              </div>

              {/* Wind Speed and Direction Arrow */}
              <div className="flex items-center gap-1.5 w-20 justify-end text-xs font-semibold text-white/70">
                <Navigation
                  className="w-3 h-3 text-cyan-400 fill-cyan-400/20"
                  style={{ transform: `rotate(${day.windDirection}deg)` }}
                />
                <span>{Math.round(day.windSpeed)} km/h</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
