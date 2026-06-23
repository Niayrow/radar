import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AéroMétéo | Prévisions Météo Ultra-Détaillées & Bento Grid",
  description: "Suivez la météo heure par heure avec des prévisions ultra-précises de température, vent, UV, et humidité. Une interface de luxe dynamique et adaptative.",
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
