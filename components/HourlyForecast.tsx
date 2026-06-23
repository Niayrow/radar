"use client";

import React, { useMemo } from "react";
import { getWMOInfo, WeatherTheme } from "../utils/weatherUtils";
import { motion } from "framer-motion";
import { Droplets, Clock } from "lucide-react";

interface HourItem {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
}

interface HourlyForecastProps {
  hourly: HourItem[];
  theme: WeatherTheme;
  timezone: string;
  selectedDayDate: string | null;
  onClearSelection?: () => void;
}

// ── Per-theme accent palette ──────────────────────────────────────────────────
const THEME_ACCENTS: Record<string, {
  activeBg: string;
  activeBorder: string;
  activeGlow: string;
  iconColor: string;
  barColor: string;
  rainColor: string;
}> = {
  sunny: {
    activeBg:     "from-orange-500 to-rose-500",
    activeBorder: "border-orange-400/60",
    activeGlow:   "shadow-[0_8px_24px_rgba(249,115,22,0.5)]",
    iconColor:    "text-orange-300",
    barColor:     "bg-orange-400",
    rainColor:    "text-sky-300",
  },
  rain: {
    activeBg:     "from-cyan-500 to-blue-600",
    activeBorder: "border-cyan-400/60",
    activeGlow:   "shadow-[0_8px_24px_rgba(6,182,212,0.5)]",
    iconColor:    "text-cyan-300",
    barColor:     "bg-cyan-400",
    rainColor:    "text-cyan-300",
  },
  cloudy: {
    activeBg:     "from-violet-500 to-fuchsia-600",
    activeBorder: "border-violet-400/60",
    activeGlow:   "shadow-[0_8px_24px_rgba(139,92,246,0.5)]",
    iconColor:    "text-violet-300",
    barColor:     "bg-violet-400",
    rainColor:    "text-violet-300",
  },
  cold: {
    activeBg:     "from-sky-500 to-teal-500",
    activeBorder: "border-sky-400/60",
    activeGlow:   "shadow-[0_8px_24px_rgba(14,165,233,0.5)]",
    iconColor:    "text-sky-300",
    barColor:     "bg-sky-400",
    rainColor:    "text-sky-300",
  },
};

export default function HourlyForecast({
  hourly,
  theme,
  timezone,
  selectedDayDate,
  onClearSelection,
}: HourlyForecastProps) {

  // ── Slice the right hours ──────────────────────────────────────────────
  const { hoursToShow, isFiltered } = useMemo(() => {
    if (selectedDayDate) {
      return {
        hoursToShow: hourly.filter((h) => h.time.startsWith(selectedDayDate)),
        isFiltered: true,
      };
    }

    let startIndex = 0;
    try {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", hour12: false,
      });
      const parts = fmt.formatToParts(now);
      const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
      const localStr = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:00`;
      const found = hourly.findIndex((h) => h.time >= localStr);
      if (found !== -1) startIndex = found;
    } catch {}

    return {
      hoursToShow: hourly.slice(startIndex, startIndex + 24),
      isFiltered: false,
    };
  }, [hourly, selectedDayDate, timezone]);

  // ── Temperature range for mini bar ────────────────────────────────────
  const { minTemp, maxTemp } = useMemo(() => {
    const temps = hoursToShow.map((h) => h.temperature);
    return {
      minTemp: Math.min(...temps),
      maxTemp: Math.max(...temps),
    };
  }, [hoursToShow]);

  const tempBarPct = (t: number) =>
    maxTemp === minTemp
      ? 50
      : Math.round(((t - minTemp) / (maxTemp - minTemp)) * 100);

  // ── Label helpers ──────────────────────────────────────────────────────
  const formatHour = (timeStr: string, idx: number) => {
    if (idx === 0 && !isFiltered) return "Now";
    try {
      return new Date(timeStr)
        .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        .replace(":00", "h");
    } catch {
      return timeStr.split("T")[1]?.slice(0, 5) ?? timeStr;
    }
  };

  const getTitle = () => {
    if (isFiltered && selectedDayDate) {
      try {
        const d = new Date(selectedDayDate + "T00:00:00");
        const label = d.toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "short",
        });
        return label.charAt(0).toUpperCase() + label.slice(1);
      } catch {}
      return "Journée";
    }
    return "Prévisions horaires";
  };

  const accent = THEME_ACCENTS[theme.type] ?? THEME_ACCENTS.cloudy;

  return (
    <div className={`p-4 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 glass-border-hover`}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">
            {getTitle()}
          </span>
        </div>
        {isFiltered && onClearSelection && (
          <button
            onClick={onClearSelection}
            className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white/60 border border-white/10 shrink-0"
          >
            ← Aujourd&apos;hui
          </button>
        )}
      </div>

      {/* ── Scrollable cards ────────────────────────────────────────────── */}
      {/* pt-3 so the top "Now" dot isn't clipped, pr-2 so last card breathes */}
      <div className="flex gap-2 overflow-x-auto pt-3 pb-3 snap-x custom-scrollbar select-none">
        {hoursToShow.map((item, index) => {
          const wmo      = getWMOInfo(item.weatherCode);
          const Icon     = wmo.icon;
          const isCurrent = index === 0 && !isFiltered;
          const barH     = tempBarPct(item.temperature);
          const hasRain  = item.precipitationProbability > 0;

          return (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: Math.min(index * 0.022, 0.44),
                type: "spring",
                stiffness: 200,
                damping: 22,
              }}
              whileHover={{ y: -4, scale: 1.04 }}
              className={[
                "relative flex flex-col items-center snap-start shrink-0",
                "w-[66px] rounded-2xl pt-3 pb-2.5 px-1.5",
                "border transition-all duration-200",
                isCurrent
                  ? `bg-gradient-to-b ${accent.activeBg} ${accent.activeBorder} ${accent.activeGlow}`
                  : "bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.13]",
              ].join(" ")}
            >
              {/* ● "Now" dot above card */}
              {isCurrent && (
                <span className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
              )}

              {/* Hour label */}
              <span className={[
                "text-[9px] font-black tracking-wide mb-2 leading-none",
                isCurrent ? "text-white/90" : "text-white/35",
              ].join(" ")}>
                {formatHour(item.time, index)}
              </span>

              {/* Icon */}
              <Icon className={[
                "w-6 h-6 mb-2",
                isCurrent
                  ? "text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                  : accent.iconColor,
              ].join(" ")} />

              {/* Temperature */}
              <span className={[
                "text-[15px] font-black leading-none",
                isCurrent ? "text-white" : "text-white/80",
              ].join(" ")}>
                {Math.round(item.temperature)}°
              </span>

              {/* Mini temp bar */}
              <div className="w-full mt-2 px-0.5">
                <div className="h-[3px] rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barH}%` }}
                    transition={{ delay: 0.12 + index * 0.02, duration: 0.5, ease: "easeOut" }}
                    className={[
                      "h-full rounded-full",
                      isCurrent ? "bg-white/60" : accent.barColor,
                    ].join(" ")}
                  />
                </div>
              </div>

              {/* Rain % */}
              <div className="h-[18px] flex items-center justify-center mt-1">
                {hasRain && (
                  <span className={[
                    "flex items-center gap-[2px] text-[8.5px] font-black",
                    isCurrent ? "text-white/75" : accent.rainColor,
                  ].join(" ")}>
                    <Droplets className="w-2 h-2 shrink-0" />
                    {item.precipitationProbability}%
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Trailing spacer — prevents last card from being clipped */}
        <div className="w-2 shrink-0" />
      </div>

      {/* ── Min / Max legend ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-1">
        <span className="flex items-center gap-1.5 text-[10px] text-white/30 font-semibold">
          <span className={`w-1.5 h-1.5 rounded-full ${accent.barColor} opacity-50`} />
          Min {Math.round(minTemp)}°
        </span>
        <div className="flex-1 mx-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="flex items-center gap-1.5 text-[10px] text-white/30 font-semibold">
          Max {Math.round(maxTemp)}°
          <span className={`w-1.5 h-1.5 rounded-full ${accent.barColor}`} />
        </span>
      </div>
    </div>
  );
}
