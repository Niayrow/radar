import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  Snowflake, 
  CloudLightning,
  HelpCircle
} from "lucide-react";

export interface WeatherTheme {
  name: string;
  description: string;
  background: string;
  glassBg: string;
  glassBorder: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  chartColors: {
    temp: string;
    apparent: string;
    grid: string;
    tooltipBg: string;
  };
  animationType: "sunny" | "rainy" | "cloudy" | "snowy" | "mild";
}

export function getWeatherDetails(code: number): { label: string; icon: any } {
  switch (code) {
    case 0:
      return { label: "Ciel Dégagé", icon: Sun };
    case 1:
      return { label: "Principalement Dégagé", icon: CloudSun };
    case 2:
      return { label: "Partiellement Nuageux", icon: CloudSun };
    case 3:
      return { label: "Couvert", icon: Cloud };
    case 45:
      return { label: "Brouillard", icon: CloudFog };
    case 48:
      return { label: "Brouillard Givrant", icon: CloudFog };
    case 51:
      return { label: "Bruine Légère", icon: CloudDrizzle };
    case 53:
      return { label: "Bruine Modérée", icon: CloudDrizzle };
    case 55:
      return { label: "Bruine Dense", icon: CloudDrizzle };
    case 56:
      return { label: "Bruine Verglaçante Légère", icon: CloudSnow };
    case 57:
      return { label: "Bruine Verglaçante Forte", icon: CloudSnow };
    case 61:
      return { label: "Pluie Légère", icon: CloudRain };
    case 63:
      return { label: "Pluie Modérée", icon: CloudRain };
    case 65:
      return { label: "Pluie Forte", icon: CloudRain };
    case 66:
      return { label: "Pluie Verglaçante Légère", icon: CloudSnow };
    case 67:
      return { label: "Pluie Verglaçante Forte", icon: CloudSnow };
    case 71:
      return { label: "Chute de Neige Légère", icon: Snowflake };
    case 73:
      return { label: "Chute de Neige Modérée", icon: Snowflake };
    case 75:
      return { label: "Chute de Neige Forte", icon: Snowflake };
    case 77:
      return { label: "Grains de Neige", icon: Snowflake };
    case 80:
      return { label: "Averses de Pluie Légères", icon: CloudRain };
    case 81:
      return { label: "Averses de Pluie Modérées", icon: CloudRain };
    case 82:
      return { label: "Averses de Pluie Violentes", icon: CloudRain };
    case 85:
      return { label: "Averses de Neige Légères", icon: Snowflake };
    case 86:
      return { label: "Averses de Neige Fortes", icon: Snowflake };
    case 95:
      return { label: "Orage Faible ou Modéré", icon: CloudLightning };
    case 96:
      return { label: "Orage avec Grêle Légère", icon: CloudLightning };
    case 99:
      return { label: "Orage avec Grêle Forte", icon: CloudLightning };
    default:
      return { label: "Inconnu", icon: HelpCircle };
  }
}

export function getWeatherTheme(code: number, temp: number): WeatherTheme {
  // 1. Cold / Polar / Snow: temp < 3°C or codes 71-77, 85-86
  if (temp < 3 || [71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      name: "Glacial & Cristallin",
      description: "Ambiance hivernale épurée avec lueurs blanches subtiles et accents bleu néon glacé.",
      background: "bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-900",
      glassBg: "bg-white/5 backdrop-blur-md",
      glassBorder: "border-sky-300/20 shadow-lg shadow-sky-950/50",
      textColor: "text-slate-100",
      subtextColor: "text-sky-200/70",
      accentColor: "text-sky-300",
      chartColors: {
        temp: "#7dd3fc", // sky-300
        apparent: "#a5b4fc", // indigo-300
        grid: "rgba(125, 211, 252, 0.1)",
        tooltipBg: "rgba(15, 23, 42, 0.85)",
      },
      animationType: "snowy",
    };
  }

  // 2. Rain / Storm: codes 51-67, 80-82, 95-99
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
    return {
      name: "Pluvieux & Tempétueux",
      description: "Dégradé sombre et dramatique avec overlay de pluie tombante et accents bleu électrique.",
      background: "bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-950",
      glassBg: "bg-black/20 backdrop-blur-md",
      glassBorder: "border-white/10 shadow-lg shadow-black/40",
      textColor: "text-zinc-100",
      subtextColor: "text-zinc-400",
      accentColor: "text-cyan-400",
      chartColors: {
        temp: "#22d3ee", // cyan-400
        apparent: "#3b82f6", // blue-500
        grid: "rgba(34, 211, 238, 0.1)",
        tooltipBg: "rgba(9, 9, 11, 0.9)",
      },
      animationType: "rainy",
    };
  }

  // 3. Cloudy / Fog: codes 2, 3, 45, 48
  if ([2, 3, 45, 48].includes(code)) {
    return {
      name: "Doux & Cotonneux",
      description: "Dégradé feutré et minimaliste inspiré des ciels nuageux et brumeux.",
      background: "bg-gradient-to-br from-slate-800 via-blue-900/30 to-zinc-800",
      glassBg: "bg-white/10 backdrop-blur-md",
      glassBorder: "border-white/15 shadow-md shadow-slate-950/20",
      textColor: "text-white",
      subtextColor: "text-slate-300",
      accentColor: "text-slate-200",
      chartColors: {
        temp: "#cbd5e1", // slate-300
        apparent: "#94a3b8", // slate-400
        grid: "rgba(255, 255, 255, 0.08)",
        tooltipBg: "rgba(30, 41, 59, 0.85)",
      },
      animationType: "cloudy",
    };
  }

  // 4. Hot / Sun: temp > 25°C or (code 0, 1 and temp >= 15°C)
  if (temp > 25 || ([0, 1].includes(code) && temp >= 15)) {
    return {
      name: "Grand Soleil & Canicule",
      description: "Dégradé vibrant et chaleureux avec ombres portées chaudes et accents solaires.",
      background: "bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700",
      glassBg: "bg-white/15 backdrop-blur-md",
      glassBorder: "border-white/20 shadow-xl shadow-orange-950/30",
      textColor: "text-white",
      subtextColor: "text-amber-100/80",
      accentColor: "text-yellow-300",
      chartColors: {
        temp: "#fde047", // yellow-300
        apparent: "#f87171", // red-400
        grid: "rgba(253, 224, 71, 0.15)",
        tooltipBg: "rgba(124, 45, 18, 0.9)",
      },
      animationType: "sunny",
    };
  }

  // 5. Mild / Default (Printemps/Automne clair): default
  return {
    name: "Printemps Clément",
    description: "Teintes fraîches et dynamiques pour une journée claire aux températures modérées.",
    background: "bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950",
    glassBg: "bg-white/10 backdrop-blur-md",
    glassBorder: "border-white/20 shadow-lg shadow-indigo-950/50",
    textColor: "text-white",
    subtextColor: "text-cyan-200/70",
    accentColor: "text-cyan-300",
    chartColors: {
      temp: "#67e8f9", // cyan-300
      apparent: "#818cf8", // indigo-400
      grid: "rgba(103, 232, 249, 0.1)",
      tooltipBg: "rgba(17, 24, 39, 0.85)",
    },
    animationType: "mild",
  };
}

export function getWindDirection(degree: number): string {
  const directions = [
    "Nord (N)",
    "Nord-Nord-Est (NNE)",
    "Nord-Est (NE)",
    "Est-Nord-Est (ENE)",
    "Est (E)",
    "Est-Sud-Est (ESE)",
    "Sud-Est (SE)",
    "Sud-Sud-Est (SSE)",
    "Sud (S)",
    "Sud-Sud-Ouest (SSO)",
    "Sud-Ouest (SO)",
    "Ouest-Sud-Ouest (OSO)",
    "Ouest (O)",
    "Ouest-Nord-Ouest (ONO)",
    "Nord-Ouest (NO)",
    "Nord-Nord-Ouest (NNO)",
  ];
  const idx = Math.floor((degree + 11.25) / 22.5) % 16;
  return directions[idx];
}

export function formatTime(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}
