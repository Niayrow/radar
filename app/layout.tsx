import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://radarmeteo.sofianeweb.fr"),
  title: "Aura Météo | Prévisions Interactives & Bento Grid",
  description: "Suivez la météo en temps réel et heure par heure avec des prévisions ultra-précises (température, vent, UV, humidité) via une interface moderne et dynamique.",
  keywords: ["météo", "prévisions météo", "aura météo", "météo heure par heure", "météo 10 jours", "application météo", "température", "pluie", "index uv"],
  authors: [{ name: "Aura Météo" }],
  creator: "Aura Météo",
  publisher: "Aura Météo",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://radarmeteo.sofianeweb.fr",
    title: "Aura Météo | Prévisions Interactives & Design Premium",
    description: "Consultez la météo en direct de votre ville avec une interface moderne et dynamique. Températures, vent, UV et précipitations.",
    siteName: "Aura Météo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura Météo | Prévisions Interactives",
    description: "La météo heure par heure et à 10 jours en temps réel dans une application web (PWA) ultra-design.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aura Météo",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#07080f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
