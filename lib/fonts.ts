import { GFS_Didot, Geist_Mono, Montserrat } from "next/font/google";

/** Brand: Montserrat per i testi, GFS Didot per titoli e numeri grandi. */
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const didot = GFS_Didot({
  weight: "400",
  variable: "--font-didot",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Classi da mettere su <html>: definiscono tutte le variabili dei font. */
export const fontVars = `${montserrat.variable} ${didot.variable} ${geistMono.variable}`;
