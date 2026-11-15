import { GFS_Didot, Montserrat } from "next/font/google";

const didot = GFS_Didot({
  weight: "400",
  variable: "--font-didot",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

/** Classi che definiscono le variabili --font-didot e --font-montserrat. */
export const expoFontVars = `${didot.variable} ${montserrat.variable}`;
