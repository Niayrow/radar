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

/** Reliability colour: green ≥85, amber ≥65, orange ≥50, red below */
function reliabilityColor(r: number): string {
  if (r >= 85) return "text-emerald-400";
  if (r >= 65) return "text-amber-400";
  if (r >= 50) return "text-orange-400";
  return "text-rose-400";
}

function reliabilityBarColor(r: number): string {
  if (r >= 85) return "bg-emerald-400";
  if (r >= 65) return "bg-amber-400";
  if (r >= 50) return "bg-orange-400";
  return "bg-rose-400";
}

function reliabilityLabel(r: number): string {
  if (r >= 85) return "Fiable";
  if (r >= 65) return "Bon";
  if (r >= 50) return "Incertain";
  return "Faible";
}

export default function DailyForecastsList({
  hourly,
  theme,
  selectedDayDate,
  onSelectDay,
}: DailyForecastsListProps) {
  const dailyData = getDailyForecasts(hourly);

  return (
    <div className={`p-4 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 ${theme.glowClass} glass-border-hover`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className={`w-3.5 h-3.5 ${theme.accentText} shrink-0`} />
          <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">
            Prévisions 10 jours
          </span>
        </div>
        <span className="text-[9px] text-white/25 font-semibold uppercase tracking-wider">
          Fiabilité
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {dailyData.map((day, index) => {
          const wmo = getWMOInfo(day.weatherCode);
          const Icon = wmo.icon;
          const isSelected = day.date === selectedDayDate;
          const rColor    = reliabilityColor(day.reliability);
          const rBarColor = reliabilityBarColor(day.reliability);
          const rLabel    = reliabilityLabel(day.reliability);
          const isToday   = index === 0;

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, type: "spring", stiffness: 200, damping: 22 }}
              onClick={() => onSelectDay(day.date)}
              className={[
                "flex items-center gap-2 py-2.5 px-2.5 rounded-xl cursor-pointer transition-all duration-200",
                isSelected
                  ? "bg-white/[0.12] border border-white/[0.18] shadow-[0_4px_16px_rgba(255,255,255,0.04)]"
                  : "border border-transparent hover:bg-white/[0.05] hover:border-white/[0.08]",
              ].join(" ")}
            >
              {/* ── Day + date ────────────────────────── */}
              <div className="w-[72px] flex flex-col gap-0.5 shrink-0">
                <span className={`text-[11px] font-black leading-none ${isToday ? "text-white" : "text-white/75"}`}>
                  {isToday ? "Aujourd'hui" : day.dayLabel}
                </span>
                <span className="text-[9px] text-white/35 font-semibold leading-none">
                  {day.fullDateLabel}
                </span>
              </div>

              {/* ── Weather icon ──────────────────────── */}
              <div className="w-7 flex justify-center shrink-0">
                <Icon className={`w-5 h-5 ${theme.accentText}`} />
              </div>

              {/* ── Temperatures ─────────────────────── */}
              <div className="flex items-center gap-1.5 w-[70px] justify-end shrink-0">
                <span className="text-[13px] font-black text-white leading-none">
                  {Math.round(day.maxTemp)}°
                </span>
                <span className="text-[11px] font-semibold text-white/35 leading-none">
                  {Math.round(day.minTemp)}°
                </span>
              </div>

              {/* ── Reliability ───────────────────────── */}
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black ${rColor}`}>
                    {rLabel}
                  </span>
                  <span className={`text-[9px] font-black tabular-nums ${rColor}`}>
                    {day.reliability}%
                  </span>
                </div>
                {/* Reliability bar */}
                <div className="h-[3px] rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${day.reliability}%` }}
                    transition={{ delay: 0.1 + index * 0.04, duration: 0.55, ease: "easeOut" }}
                    className={`h-full rounded-full ${rBarColor} opacity-80`}
                  />
                </div>
              </div>

              {/* ── Wind ─────────────────────────────── */}
              <div className="flex items-center gap-1 w-[52px] justify-end shrink-0">
                <Navigation
                  className="w-2.5 h-2.5 text-cyan-400/70 shrink-0"
                  style={{ transform: `rotate(${day.windDirection}deg)` }}
                />
                <span className="text-[9px] font-semibold text-white/40 tabular-nums">
                  {Math.round(day.windSpeed)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend footer */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.06] flex-wrap">
        {[
          { color: "bg-emerald-400", label: "Fiable ≥85%" },
          { color: "bg-amber-400",   label: "Bon ≥65%" },
          { color: "bg-orange-400",  label: "Incertain ≥50%" },
          { color: "bg-rose-400",    label: "Faible" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />
            <span className="text-[8.5px] text-white/25 font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
