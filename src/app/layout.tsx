import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F59E0B",
};

export const metadata: Metadata = {
  title: "Nano Ads Banana - AI Ad Creative Generator",
  description: "Create stunning ad creatives using Google Gemini AI. Upload product images, customize style, and generate professional ads in seconds.",
  keywords: ["AI", "ad creative", "Gemini", "image generation", "marketing", "advertising", "product ads", "Google AI", "creative generator"],
  authors: [{ name: "Nano Ads Banana" }],
  creator: "Nano Ads Banana",
  publisher: "Nano Ads Banana",
  metadataBase: new URL("https://nanoadsbanana.com"),
  openGraph: {
    title: "Nano Ads Banana - AI Ad Creative Generator",
    description: "Create stunning ad creatives using Google Gemini AI. Upload product images, customize style, and generate professional ads in seconds.",
    type: "website",
    locale: "en_US",
    siteName: "Nano Ads Banana",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano Ads Banana - AI Ad Creative Generator",
    description: "Create stunning ad creatives using Google Gemini AI. Upload product images, customize style, and generate professional ads in seconds.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="bottom-right" />
        <SpeedInsights />
      </body>
    </html>
  );
}
