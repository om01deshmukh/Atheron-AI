import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atheron - AI Space & Cosmos Assistant",
  description: "Ask Atheron anything about the cosmos, satellite telemetry, and orbital mechanics. Your AI guide to space science and aerospace engineering.",
  keywords: ["AI assistant", "space", "cosmos", "satellite", "orbital mechanics", "astronomy", "aerospace"],
  openGraph: {
    title: "Atheron - AI Space & Cosmos Assistant",
    description: "Your AI guide to the cosmos, orbital mechanics, and satellite technology",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
