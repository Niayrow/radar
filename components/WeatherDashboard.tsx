"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Loader2,
  Calendar,
  CloudSun,
  Bell,
  Leaf,
  Droplets,
  Sun,
  Home,
  Map,
  X,
  Navigation,
  LocateFixed,
} from "lucide-react";
import { useWeatherTheme } from "../hooks/useWeatherTheme";
import { getWMOInfo, getDailyForecasts, WeatherData } from "../utils/weatherUtils";
import HourlyForecast from "./HourlyForecast";
import WeatherChart from "./WeatherChart";
import BentoGridMetrics from "./BentoGridMetrics";
import DailyForecastsList from "./DailyForecastsList";

export default function WeatherDashboard() {
  // Coordinate and Location state (Default to Paris)
  const [lat, setLat] = useState<number>(48.8534);
  const [lon, setLon] = useState<number>(2.3488);
  const [cityName, setCityName] = useState<string>("Paris");
  const [country, setCountry] = useState<string>("France");

  // Geocoding and Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Weather Data state
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Particles / Overlays state
  const [particles, setParticles] = useState<any[]>([]);

  // Mobile App Navigation Tab State
  const [activeTab, setActiveTab] = useState<"today" | "forecast" | "map">("today");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Geolocation loading state
  const [geolocating, setGeolocating] = useState(false);

  // Selected day for hourly details
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  // Get current weather code and temperature for styling
  const weatherCode = weatherData?.current?.weatherCode;
  const temperature = weatherData?.current?.temperature;
  const theme = useWeatherTheme(weatherCode, temperature);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 120);
    } else {
      setSearchQuery("");
      setSuggestions([]);
    }
  }, [searchOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // 1. Geolocation trigger on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          
          let resolvedCity = "";
          let resolvedCountry = "";
          
          // Try Nominatim reverse geocoding
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${userLat}&lon=${userLon}`,
              {
                headers: {
                  "Accept-Language": "fr",
                  "User-Agent": "AuraWeatherApp/1.0"
                }
              }
            );
            if (res.ok) {
              const data = await res.json();
              if (data.address) {
                resolvedCity = data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.suburb || "";
                resolvedCountry = data.address.country || "";
              }
            }
          } catch (e) {
            console.log("Nominatim reverse geocoding failed, trying fallback...");
          }

          // Fallback to maps.co reverse geocoding if Nominatim failed
          if (!resolvedCity) {
            try {
              const res = await fetch(
                `https://geocode.maps.co/reverse?lat=${userLat}&lon=${userLon}`
              );
              if (res.ok) {
                const data = await res.json();
                if (data.address) {
                  resolvedCity = data.address.city || data.address.town || data.address.village || "";
                  resolvedCountry = data.address.country || "";
                }
              }
            } catch (e) {
              console.log("Fallback reverse geocoding failed.");
            }
          }

          // Apply user coordinates and actual city details simultaneously
          setLat(userLat);
          setLon(userLon);
          setCityName(resolvedCity || "Localisation GPS");
          setCountry(resolvedCountry || "Ma Position");
        },
        (err) => {
          console.warn("Geolocation refused or failed, using default Paris:", err.message);
        }
      );
    }
  }, []);

  // PWA Service Worker Registration
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const handleRegister = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered:", reg.scope))
          .catch((err) => console.error("Service Worker registration failed:", err));
      };
      if (document.readyState === "complete") {
        handleRegister();
      } else {
        window.addEventListener("load", handleRegister);
        return () => window.removeEventListener("load", handleRegister);
      }
    }
  }, []);

  // 2. Weather Fetch Trigger
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) {
          throw new Error("Impossible de récupérer les données météo");
        }
        const data = await res.json();
        setWeatherData(data);
      } catch (err: any) {
        setError(err.message || "Erreur de connexion.");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [lat, lon]);

  // 3. Debounced Search Suggestion fetcher
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchQuery
          )}&count=5&language=fr&format=json`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Geocoding search failure:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 4. Generate stable visual overlay particles on theme change
  useEffect(() => {
    if (!theme.type) return;
    
    // Choose count based on theme
    let count = 0;
    if (theme.type === "rain") count = 35;
    else if (theme.type === "cold") count = 25;
    else if (theme.type === "sunny") count = 15;

    const items = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration:
        theme.type === "rain"
          ? `${0.7 + Math.random() * 0.5}s`
          : theme.type === "cold"
          ? `${6 + Math.random() * 7}s`
          : `${6 + Math.random() * 8}s`,
      size:
        theme.type === "sunny"
          ? `${30 + Math.random() * 70}px`
          : theme.type === "cold"
          ? `${3 + Math.random() * 5}px`
          : undefined,
      top: theme.type === "sunny" ? `${Math.random() * 70}%` : undefined,
    }));
    
    setParticles(items);
  }, [theme.type]);


  const handleSelectCity = (city: any) => {
    setLat(city.latitude);
    setLon(city.longitude);
    setCityName(city.name);
    setCountry(city.country || "");
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setSearchOpen(false);
    setSelectedDayDate(null);
  };

  // Geolocation handler
  const handleGeolocate = useCallback(async () => {
    if (!navigator.geolocation) return;
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        let resolvedCity = "";
        let resolvedCountry = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${userLat}&lon=${userLon}`,
            { headers: { "Accept-Language": "fr", "User-Agent": "AuraWeatherApp/1.0" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.address) {
              resolvedCity = data.address.city || data.address.town || data.address.village || data.address.municipality || "";
              resolvedCountry = data.address.country || "";
            }
          }
        } catch {}
        setLat(userLat);
        setLon(userLon);
        setCityName(resolvedCity || "Ma position");
        setCountry(resolvedCountry || "");
        setSelectedDayDate(null);
        setSearchOpen(false);
        setGeolocating(false);
      },
      () => setGeolocating(false)
    );
  }, []);


  const getLocalDateString = () => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getWindDirectionLabel = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return "N";
    if (deg >= 22.5 && deg < 67.5) return "NE";
    if (deg >= 67.5 && deg < 112.5) return "E";
    if (deg >= 112.5 && deg < 157.5) return "SE";
    if (deg >= 157.5 && deg < 202.5) return "S";
    if (deg >= 202.5 && deg < 247.5) return "SO";
    if (deg >= 247.5 && deg < 292.5) return "O";
    return "NO";
  };

  // Find precipitation probability for the current hour
  const getCurrentHourPrecipProb = () => {
    if (!weatherData?.hourly || !weatherData?.timezone) return 0;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: weatherData.timezone,
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
      const hourData = weatherData.hourly.find((h: any) => h.time >= cityLocalStr);
      return hourData ? hourData.precipitationProbability : 0;
    } catch {
      return 0;
    }
  };

  const currentWmo = weatherData ? getWMOInfo(weatherData.current.weatherCode) : null;
  const CurrentIcon = currentWmo?.icon || CloudSun;

  // Helper to format selected day label for the modal title
  const getFormattedSelectedDayLabel = () => {
    if (!selectedDayDate) return "";
    try {
      const d = new Date(selectedDayDate + "T00:00:00");
      const label = d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      return label.charAt(0).toUpperCase() + label.slice(1);
    } catch {
      return "Prévisions horaires";
    }
  };

  // Helper to get selected day overview info
  const getSelectedDayInfo = () => {
    if (!selectedDayDate || !weatherData) return null;
    const daily = getDailyForecasts(weatherData.hourly);
    const day = daily.find((d) => d.date === selectedDayDate);
    if (!day) return null;
    const wmo = getWMOInfo(day.weatherCode);
    return {
      Icon: wmo.icon,
      wmoText: wmo.label,
      maxTemp: day.maxTemp,
      minTemp: day.minTemp,
      windSpeed: day.windSpeed,
    };
  };

  return (
    <div className="min-h-screen w-full relative overflow-y-auto p-4 md:p-8 flex flex-col items-center z-0 pb-36">
      {/* 1. Dynamic Animated Background Cross-Fade */}
      <AnimatePresence>
        <motion.div
          key={theme.type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} z-0`}
        />
      </AnimatePresence>

      {/* Dynamic Luminous Floating Background Blobs */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`blobs-${theme.type}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        >
          <div className={`bg-blob w-[380px] md:w-[600px] h-[380px] md:h-[600px] -top-20 md:-top-40 -left-20 md:-left-40 rounded-full blur-3xl opacity-60 ${theme.blob1}`} />
          <div className={`bg-blob bg-blob-2 w-[420px] md:w-[700px] h-[420px] md:h-[700px] -bottom-30 md:-bottom-60 -right-20 md:-right-40 rounded-full blur-3xl opacity-50 ${theme.blob2}`} />
        </motion.div>
      </AnimatePresence>

      {/* 2. Visual Effects Overlay */}
      {theme.type === "rain" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="rain-drop"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      )}

      {theme.type === "cold" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="snowflake"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      )}

      {theme.type === "sunny" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="warm-particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      )}

      {theme.type === "cloudy" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-white/20 blur-3xl cloud-overlay" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-slate-200/10 blur-3xl cloud-overlay" style={{ animationDelay: "-5s" }} />
        </div>
      )}

      {/* 3. Mobile Shell Container */}
      <div className="w-full max-w-md mx-auto z-10 flex flex-col gap-5 pt-2 relative">
        
        {/* App Title Header & Search Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Gradient logo mark */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-400 flex items-center justify-center shadow-[0_0_16px_rgba(217,70,239,0.5)]">
              <Leaf className="w-4 h-4 text-white fill-white/30" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
              Aura Météo
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Geolocation button */}
            <button
              onClick={handleGeolocate}
              disabled={geolocating}
              title="Ma position"
              className="p-2 rounded-xl border border-white/10 bg-white/[0.08] text-white/70 hover:bg-white/15 hover:border-white/20 transition-all disabled:opacity-50"
            >
              {geolocating
                ? <Loader2 className="w-4.5 h-4.5 animate-spin" />
                : <LocateFixed className="w-4.5 h-4.5" />}
            </button>
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl border border-white/10 bg-white/[0.08] text-white/70 hover:bg-white/15 hover:border-white/20 transition-all"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* ── FULL-SCREEN SEARCH MODAL ───────────────────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              key="search-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[200] flex flex-col"
            >
              {/* Blurred backdrop */}
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-xl"
                onClick={() => setSearchOpen(false)}
              />

              {/* Modal panel slides down from top */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="relative z-10 mx-auto w-full max-w-md px-4 pt-12 pb-4"
              >
                {/* Search card */}
                <div className="bg-slate-950/95 border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                  {/* Input row */}
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8">
                    <Search className="w-5 h-5 text-white/40 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Rechercher une ville..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-base font-semibold text-white placeholder-white/30"
                    />
                    {isSearching
                      ? <Loader2 className="w-4 h-4 animate-spin text-white/50 shrink-0" />
                      : (
                        <button
                          onClick={() => setSearchOpen(false)}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all shrink-0"
                        >
                          <X className="w-4 h-4 text-white/70" />
                        </button>
                      )
                    }
                  </div>

                  {/* Geolocation row */}
                  <button
                    onClick={handleGeolocate}
                    disabled={geolocating}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-cyan-300 hover:bg-white/5 transition-all border-b border-white/5 disabled:opacity-50"
                  >
                    {geolocating
                      ? <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      : <LocateFixed className="w-4.5 h-4.5" />}
                    <span>{geolocating ? "Détection en cours..." : "Utiliser ma position actuelle"}</span>
                  </button>

                  {/* Suggestions list */}
                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {suggestions.map((city, idx) => (
                          <motion.button
                            key={city.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => handleSelectCity(city)}
                            className="w-full flex items-center justify-between px-4 py-3.5 text-sm hover:bg-white/8 active:bg-white/12 transition-all border-b border-white/5 last:border-0"
                          >
                            <div className="flex items-center gap-3 text-left">
                              <MapPin className="w-4 h-4 text-white/30 shrink-0" />
                              <div>
                                <span className="font-bold text-white block">{city.name}</span>
                                {city.admin1 && (
                                  <span className="text-xs text-white/40">{city.admin1}, {city.country_code}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                              {city.country_code}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Empty state */}
                  {searchQuery.length >= 2 && !isSearching && suggestions.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-white/30 font-medium">
                      Aucun résultat pour « {searchQuery} »
                    </div>
                  )}

                  {/* Initial hint */}
                  {searchQuery.length < 2 && !geolocating && (
                    <div className="px-4 py-5 text-center text-xs text-white/20 font-medium">
                      Tapez au moins 2 caractères pour rechercher
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location badge & date */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-base font-bold text-white">
            <div className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <span>{cityName}{country ? `, ${country}` : ""}</span>
          </div>
          <span className="text-[11px] text-white/45 font-medium ml-7">
            {getLocalDateString()}
          </span>
        </div>

        {/* 4. Loader or Error */}
        {loading && !weatherData ? (
          <div className="flex-grow flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-white" />
            <p className="text-xs font-semibold text-white/70">
              Mise à jour des coordonnées célestes...
            </p>
          </div>
        ) : error ? (
          <div className={`p-6 rounded-2xl border text-center my-6 ${theme.cardBg} ${theme.cardBorder}`}>
            <p className="text-rose-400 font-semibold mb-2">Erreur</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : (
          /* Main Weather content dynamically loaded by activeTab */
          <div className="w-full flex flex-col gap-5">
            
            {/* TAB 1: TODAY (AUJOURD'HUI) */}
            {activeTab === "today" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-5"
              >
                {/* Hero Card */}
                <div className={`p-6 rounded-3xl ${theme.cardBg} ${theme.cardBorder} border transition-all duration-300 ${theme.glowClass} flex items-center justify-between glass-border-hover overflow-hidden relative`}>
                  {/* Subtle inner gradient shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  <div className="flex-1 flex flex-col justify-center pr-2 relative z-10">
                    <span className={`text-[10px] font-black tracking-widest ${theme.accentText} mb-2 block uppercase px-2 py-0.5 rounded-full bg-white/10 w-fit`}>
                      {currentWmo?.label}
                    </span>
                    <h2 className="text-6xl font-black tracking-tighter text-white leading-none">
                      {Math.round(temperature)}°
                    </h2>
                    <p className="text-sm font-bold text-white/50 mt-1">
                      Ressenti {Math.round(weatherData.current.apparentTemperature)}°C
                    </p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-white/80 font-semibold">
                          {Math.round(weatherData.current.windSpeed)} km/h {getWindDirectionLabel(weatherData.current.windDirection)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-center items-center relative z-10">
                    <div className={`p-5 rounded-full ${theme.accentBg} ${theme.glowClass} animate-bounce-subtle animate-pulse-glow flex items-center justify-center`}>
                      <CurrentIcon className={`w-16 h-16 ${theme.accentText} drop-shadow-[0_0_16px_currentColor]`} />
                    </div>
                  </div>
                </div>

                {/* Mini Metrics — Humidity & UV */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Humidity */}
                  <div className={`p-4 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border flex flex-col justify-between min-h-[110px] glass-border-hover transition-all relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Humidité</span>
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                        <Droplets className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 relative z-10">
                      <h3 className="text-3xl font-black text-white tracking-tighter">{weatherData.current.humidity}<span className="text-lg font-bold text-white/50">%</span></h3>
                      <span className="text-[10px] text-white/40 font-semibold">
                        {weatherData.current.humidity < 40 ? "Sec" : weatherData.current.humidity < 70 ? "Confort" : "Humide"}
                      </span>
                    </div>
                  </div>

                  {/* UV Index */}
                  <div className={`p-4 rounded-2xl ${theme.cardBg} ${theme.cardBorder} border flex flex-col justify-between min-h-[110px] glass-border-hover transition-all relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Index UV</span>
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                        <Sun className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div className="mt-2 relative z-10">
                      <h3 className="text-3xl font-black text-white tracking-tighter">{weatherData.current.uvIndex.toFixed(0)}<span className="text-lg font-bold text-white/40"> UV</span></h3>
                      <span className="text-[10px] text-white/40 font-semibold">
                        {weatherData.current.uvIndex <= 2 ? "Faible" : weatherData.current.uvIndex <= 5 ? "Modéré" : "Élevé"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hourly Forecast */}
                <HourlyForecast
                  hourly={weatherData.hourly}
                  theme={theme}
                  timezone={weatherData.timezone}
                  selectedDayDate={null}
                />

                {/* 10-Day Forecast List */}
                <DailyForecastsList
                  hourly={weatherData.hourly}
                  theme={theme}
                  selectedDayDate={selectedDayDate}
                  onSelectDay={(date) => {
                    setSelectedDayDate(date);
                  }}
                />
              </motion.div>
            )}

            {/* TAB 2: FORECAST & DETAILS (PRÉVISIONS / STATS) */}
            {activeTab === "forecast" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-5"
              >
                {/* Temperature Line Chart */}
                <WeatherChart
                  hourly={weatherData.hourly}
                  theme={theme}
                  timezone={weatherData.timezone}
                />

                {/* Other bento details (Wind direction rotating needle, Pressure chart, precipitation progress) */}
                <BentoGridMetrics
                  current={weatherData.current}
                  currentHourPrecipProb={getCurrentHourPrecipProb()}
                  theme={theme}
                />
              </motion.div>
            )}

            {/* TAB 3: RADAR MAP — EN COURS DE DÉVELOPPEMENT */}
            {activeTab === "map" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-4"
              >
                <div className={`relative rounded-3xl ${theme.cardBg} ${theme.cardBorder} border overflow-hidden glass-border-hover`}>

                  {/* ── Animated decorative background ── */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Rotating conic sweep */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
                      className="absolute -top-20 -right-20 w-72 h-72 opacity-20"
                      style={{
                        background: "conic-gradient(from 0deg, transparent 0deg, rgba(6,182,212,0.6) 60deg, transparent 120deg)"
                      }}
                    />
                    {/* Soft pulsing radar rings */}
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0, 0.15] }}
                        transition={{ repeat: Infinity, duration: 3, delay: i * 0.9, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/40"
                        style={{ width: i * 80, height: i * 80 }}
                      />
                    ))}
                    {/* Bottom gradient fade */}
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* ── Content ── */}
                  <div className="relative z-10 flex flex-col items-center text-center px-6 py-14 gap-6">

                    {/* Icon with pulsing halo */}
                    <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl"
                      />
                      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/20 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                        <Map className="w-9 h-9 text-cyan-400" />
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10">
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                      />
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">
                        En cours de développement
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-2">
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        Radar de Précipitations
                      </h2>
                      <p className="text-sm text-white/50 font-medium leading-relaxed max-w-xs">
                        La carte radar interactive avec données en temps réel est en cours de développement et sera disponible prochainement.
                      </p>
                    </div>

                    {/* Feature list preview */}
                    <div className="w-full max-w-xs flex flex-col gap-2.5 mt-1">
                      {[
                        { label: "Radar précipitations temps réel", color: "bg-cyan-400" },
                        { label: "Carte des températures animée", color: "bg-amber-400" },
                        { label: "Prévisions nuageuses 6h", color: "bg-violet-400" },
                        { label: "Alertes météo géolocalisées", color: "bg-rose-400" },
                      ].map((feat, i) => (
                        <motion.div
                          key={feat.label}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${feat.color}`} />
                          <span className="text-xs font-semibold text-white/60">{feat.label}</span>
                          <span className="ml-auto text-[9px] font-black text-white/20 uppercase tracking-wider">Bientôt</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Decorative progress bar */}
                    <div className="w-full max-w-xs flex flex-col gap-1.5 mt-2">
                      <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-wider">
                        <span>Progression</span>
                        <span>68%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "68%" }}
                          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

          </div>
        )}

      </div>

      {/* 6. Hourly Detail Modal for Selected Day */}
      <AnimatePresence>
        {selectedDayDate && (() => {
          const dayInfo = getSelectedDayInfo();
          return (
            <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDayDate(null)}
                className="absolute inset-0 bg-black/75 backdrop-blur-md"
              />
              
              {/* Modal Card Sheet */}
              <motion.div
                initial={{ y: "100%", opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0.5 }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="relative w-full max-w-md bg-slate-950/95 border-t md:border border-white/[0.08] backdrop-blur-3xl rounded-t-[32px] md:rounded-[24px] overflow-hidden p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] z-10 flex flex-col gap-4 text-white"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-0.5">Détails de la journée</span>
                    <h2 className="text-base font-black tracking-tight">{getFormattedSelectedDayLabel()}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedDayDate(null)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Day Weather Overview card inside modal */}
                {dayInfo && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <dayInfo.Icon className={`w-8 h-8 ${theme.accentText}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white">{dayInfo.wmoText}</span>
                        <span className="text-[10px] text-white/40 font-semibold mt-0.5">Vent max: {Math.round(dayInfo.windSpeed)} km/h</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-0.5">
                      <span className="text-base font-black text-white">{Math.round(dayInfo.maxTemp)}°C</span>
                      <span className="text-[10px] font-semibold text-white/30">Min: {Math.round(dayInfo.minTemp)}°C</span>
                    </div>
                  </div>
                )}

                {/* Scrollable Hourly forecast list */}
                <HourlyForecast
                  hourly={weatherData.hourly}
                  theme={theme}
                  timezone={weatherData.timezone}
                  selectedDayDate={selectedDayDate}
                  onClearSelection={() => setSelectedDayDate(null)}
                />
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* 5. Floating Bottom Navigation Bar + Copyright (Fixed on Mobile, In-flow on PC) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-md flex flex-col items-center gap-2 z-50 md:relative md:bottom-0 md:left-0 md:translate-x-0 md:mt-8 md:mb-2 md:z-10 px-4">
        <div className="w-full bg-black/50 border border-white/[0.08] backdrop-blur-3xl rounded-2xl py-3 px-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex items-center justify-around">
          {([
            { id: "today",    icon: Home,     label: "Aujourd'hui" },
            { id: "forecast", icon: Calendar,  label: "Prévisions" },
            { id: "map",      icon: Map,       label: "Carte" },
          ] as { id: "today"|"forecast"|"map", icon: any, label: string }[]).map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 ${
                  isActive ? "scale-105" : "opacity-50 hover:opacity-80"
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-br ${theme.bgGradient} shadow-[0_4px_16px_rgba(0,0,0,0.4)]`
                    : "bg-transparent"
                }`}>
                  <Icon className={`w-5 h-5 ${ isActive ? "text-white" : "text-white/60" }`} />
                </div>
                <span className={`text-[9px] font-black tracking-wide ${ isActive ? "text-white" : "text-white/40" }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-white/30 font-medium tracking-wide">
          © {new Date().getFullYear()} — Créé par{" "}
          <a
            href="https://sofianeweb.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white/80 transition-colors underline-offset-2 hover:underline"
          >
            sofianeweb.fr
          </a>
        </p>
      </div>
    </div>
  );
}
