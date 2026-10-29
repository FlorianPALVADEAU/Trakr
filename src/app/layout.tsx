import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trakr",
  description: "Coaching, séances et récupération — au même endroit.",
  appleWebApp: { capable: true, title: "Trakr", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = {
  themeColor: "#0b0c0e", width: "device-width", initialScale: 1, viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
