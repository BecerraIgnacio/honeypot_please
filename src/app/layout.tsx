import type { Metadata, Viewport } from "next";
import { Archivo_Black, IBM_Plex_Mono, VT323 } from "next/font/google";
import { parseHttpUrl } from "@/share/config";
import "./globals.css";

const pixel = VT323({ variable: "--font-pixel", weight: "400", subsets: ["latin"], display: "swap" });
const mono = IBM_Plex_Mono({ variable: "--font-mono", weight: ["400", "500", "700"], subsets: ["latin"], display: "swap" });
const display = Archivo_Black({ variable: "--font-display", weight: "400", subsets: ["latin"], display: "swap" });

const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const gameUrl = parseHttpUrl(process.env.NEXT_PUBLIC_GAME_URL) ?? (vercel ? `https://${vercel}` : "http://localhost:3000");
const title = "HONEYPOT, PLEASE";
const description =
  "The world's most valuable man. The world's least reliable dating pool. A parody checkpoint game: inspect documents, catch spies, protect the market cap.";

export const metadata: Metadata = {
  metadataBase: new URL(gameUrl),
  title,
  description,
  applicationName: title,
  openGraph: {
    type: "website",
    title,
    description,
    siteName: title,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "HONEYPOT, PLEASE" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0f0e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pixel.variable} ${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
