import WeatherDashboard from "../components/WeatherDashboard";

export const metadata = {
  title: "Aura Météo - Prévisions Interactives Heure par Heure",
  description: "Découvrez vos prévisions météo heure par heure avec une interface Bento Grid & Glassmorphism ultra-dynamique, changeant de couleur en temps réel.",
};

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-start relative">
      <WeatherDashboard />
    </main>
  );
}
