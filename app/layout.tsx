import type { Metadata, Viewport } from "next";
import { VT323 } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const vt = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt",
});

export const metadata: Metadata = {
  title: "Party Habit",
  description: "Tracker de hábitos, metas y finanzas personales con estética Party Hard.",
  applicationName: "Party Habit",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Party Habit",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${vt.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
