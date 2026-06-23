import WeatherDashboard from "../components/WeatherDashboard";

export const metadata = {
  title: "Aura Météo - La Météo Heure par Heure & Prévisions à 10 Jours",
  description: "Découvrez vos prévisions météo complètes : météo heure par heure, à 10 jours, qualité de l'air, vent et UV. Interface fluide, dynamique et ultra-précise.",
};

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-start relative">
      <WeatherDashboard />
    </main>
  );
}
