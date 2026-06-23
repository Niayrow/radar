"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { WeatherTheme } from "../utils/weatherUtils";

interface WeatherChartProps {
  hourly: Array<{
    time: string;
    temperature: number;
    apparentTemperature: number;
  }>;
  theme: WeatherTheme;
  timezone: string;
}

const themeColors = {
  sunny: {
    temp: "#fbbf24", // amber-400
    apparent: "#f87171", // red-400
    axis: "rgba(255, 255, 255, 0.7)",
    grid: "rgba(255, 255, 255, 0.1)",
    tooltipBg: "rgba(24, 24, 27, 0.85)",
  },
  rain: {
    temp: "#22d3ee", // cyan-400
    apparent: "#60a5fa", // blue-400
    axis: "rgba(207, 250, 254, 0.7)",
    grid: "rgba(255, 255, 255, 0.05)",
    tooltipBg: "rgba(15, 23, 42, 0.85)",
  },
  cloudy: {
    temp: "#f1f5f9", // slate-100
    apparent: "#cbd5e1", // slate-300
    axis: "rgba(255, 255, 255, 0.7)",
    grid: "rgba(255, 255, 255, 0.08)",
    tooltipBg: "rgba(24, 24, 27, 0.85)",
  },
  cold: {
    temp: "#22d3ee", // cyan-400
    apparent: "#c084fc", // purple-400
    axis: "rgba(255, 255, 255, 0.8)",
    grid: "rgba(255, 255, 255, 0.08)",
    tooltipBg: "rgba(15, 23, 42, 0.85)",
  },
};

export default function WeatherChart({ hourly, theme, timezone }: WeatherChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-[300px] w-full animate-pulse rounded-2xl ${theme.cardBg} ${theme.cardBorder} border`} />
    );
  }

  // Get index matching current timezone hour
  let startIndex = 0;
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const hour = parts.find((p) => p.type === "hour")?.value;
    
    const cityLocalStr = `${year}-${month}-${day}T${hour}:00`;
    const foundIndex = hourly.findIndex((h) => h.time >= cityLocalStr);
    if (foundIndex !== -1) {
      startIndex = foundIndex;
    }
  } catch (error) {
    console.error("Error matching city timezone for chart start:", error);
  }

  // Get next 12 hours for the chart
  const next12Hours = hourly.slice(startIndex, startIndex + 12);

  // Format chart data
  const data = next12Hours.map((item) => {
    let hourLabel = "";
    try {
      const date = new Date(item.time);
      hourLabel = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":00", "h");
    } catch {
      hourLabel = item.time.split("T")[1]?.slice(0, 5) || item.time;
    }
    return {
      name: hourLabel,
      temp: Math.round(item.temperature),
      feel: Math.round(item.apparentTemperature),
    };
  });

  const colors = themeColors[theme.type];
  return (
    <div className={`p-5 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 ${theme.glowClass} glass-border-hover flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Tendances des Températures (12h)
        </h3>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.temp }} />
            <span className="text-white/80">Température</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.apparent }} />
            <span className="text-white/80">Ressenti</span>
          </div>
        </div>
      </div>

      <div className="w-full flex-grow h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.temp} stopOpacity={0.4} />
                <stop offset="95%" stopColor={colors.temp} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorFeel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.apparent} stopOpacity={0.4} />
                <stop offset="95%" stopColor={colors.apparent} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
            <XAxis
              dataKey="name"
              stroke={colors.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke={colors.axis}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-8}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                borderColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                color: "#ffffff",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
              }}
              labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              itemStyle={{ fontSize: "12px" }}
              formatter={(value: any, name: any) => [
                `${value}°C`,
                name === "temp" ? "Température" : "Ressenti",
              ]}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke={colors.temp}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTemp)"
            />
            <Area
              type="monotone"
              dataKey="feel"
              stroke={colors.apparent}
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorFeel)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
