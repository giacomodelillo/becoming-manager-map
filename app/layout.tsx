import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Horizon",
  description: "Horizon",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children, detail }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body className="h-full font-sans antialiased">
        <AppShell detail={detail}>{children}</AppShell>
      </body>
    </html>
  );
}
