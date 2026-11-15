import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/shell/app-shell";
import { fontVars } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Becoming Manager",
  description:
    "Scopri le aziende, scegli il tuo numero e costruisci il tuo percorso.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#11071F",
};

export default function RootLayout({ children, detail }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${fontVars} dark h-full`}
      suppressHydrationWarning
    >
      <body className="h-full bg-background font-sans antialiased">
        <AppShell detail={detail}>{children}</AppShell>
      </body>
    </html>
  );
}
