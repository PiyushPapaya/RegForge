import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://reg-forge.vercel.app";
const DESCRIPTION =
  "Drop a sensor datasheet PDF. RegForge extracts a verified register map, you correct anything the model got wrong, then it generates a header, driver skeleton, and a page-cited init sequence — from deterministic templates, never hallucinated.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RegForge — datasheet → C driver",
    template: "%s · RegForge",
  },
  description: DESCRIPTION,
  applicationName: "RegForge",
  authors: [{ name: "Piyush Nagpal" }],
  keywords: ["embedded", "firmware", "C driver", "datasheet", "register map", "I2C", "SPI", "code generation"],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "RegForge",
    title: "RegForge — datasheet → C driver",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "RegForge — datasheet → C driver",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
