import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://radarmeteo.sofianeweb.fr"),

  // === TITLE (très important) ===
  title: {
    default: "Aura Météo | Prévisions Météo France en Temps Réel",
    template: "%s | Aura Météo",
  },

  // === DESCRIPTION (optimisée ~155 caractères) ===
  description: "Prévisions météo précises en France : température, vent, UV, humidité, pluie heure par heure et sur 10 jours. Interface moderne premium et application web installable (PWA).",

  keywords: [
    "météo france",
    "prévisions météo",
    "météo heure par heure",
    "météo 10 jours",
    "application météo",
    "météo interactive",
    "radar météo",
    "température",
    "pluie",
    "indice uv",
    "aura météo",
  ],

  authors: [{ name: "Aura Météo", url: "https://radarmeteo.sofianeweb.fr" }],
  creator: "Aura Météo",
  publisher: "Aura Météo",
  category: "Weather",

  // === ROBOTS (renforcé) ===
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // === CANONICAL ===
  alternates: {
    canonical: "/",
  },

  // === OPEN GRAPH (Social) ===
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://radarmeteo.sofianeweb.fr",
    title: "Aura Météo - Prévisions Météo Précises & Design Premium",
    description: "L'application météo moderne pour la France. Consultez les prévisions en temps réel, heure par heure et sur 10 jours dans une interface ultra-design.",
    siteName: "Aura Météo",
    images: [
      {
        url: "/og-image.png", // ← IMPORTANT : à créer (1200x630px)
        width: 1200,
        height: 630,
        alt: "Aura Météo - Prévisions météo interactives et design premium",
      },
    ],
  },

  // === TWITTER CARD ===
  twitter: {
    card: "summary_large_image",
    title: "Aura Météo | Prévisions Météo Interactives en France",
    description: "Météo heure par heure et à 10 jours en temps réel. Design premium, PWA installable.",
    images: ["/og-image.png"],
    creator: "@tonhandle", // ← à modifier avec ton vrai handle
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aura Météo",
  },

  // === ICÔNES (complètes) ===
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
    shortcut: "/favicon.ico",
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