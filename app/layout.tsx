import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Hábitos, metas y finanzas personales dentro de tu propia habitación.",
  applicationName: "Habit Tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Habit Tracker",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#121418",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
