import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Athey - AI Space & Cosmos Assistant",
  description: "Ask Athey anything about the cosmos, satellites, SpaceX, ISRO, and more. Real-time space data at your fingertips. Your AI guide to the universe.",
  keywords: ["AI assistant", "space", "cosmos", "satellite tracking", "SpaceX", "ISRO", "NASA", "orbital mechanics", "astronomy", "ISS"],
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
  openGraph: {
    title: "Athey - AI Space & Cosmos Assistant",
    description: "Real-time satellite tracking, SpaceX launches, and cosmic exploration with Athey",
    type: "website",
    images: [
      {
        url: "/opengl.png",
        width: 1200,
        height: 630,
        alt: "Athey - AI Space & Cosmos Assistant",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload SF Pro Display font */}
        <link
          rel="preload"
          href="/fonts/SFPRODISPLAYREGULAR.OTF"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
