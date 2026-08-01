import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { BadgeToastProvider } from "@/components/badges/BadgeToast";
import FacebookPixel from "@/components/tracking/FacebookPixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VocationUp by Second Chance",
  description:
    "Un neighborhood para ordenar tu camino vocacional, conectar y construir con otros.",
  applicationName: "VocationUp",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VocationUp",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B2E59",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <BadgeToastProvider>
          <FacebookPixel />
          {children}
        </BadgeToastProvider>
      </body>
    </html>
  );
}
