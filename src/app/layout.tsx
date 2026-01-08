import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#ffffff",
          colorBackground: "#000000",
          colorInputBackground: "#1a1a1a",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#888888",
          colorDanger: "#ff4444",
        },
        layout: {
          logoImageUrl: "/logo.jpeg",
          logoPlacement: "inside",
          showOptionalFields: false,
          socialButtonsVariant: "blockButton",
        },
        elements: {
          formButtonPrimary: "bg-white text-black hover:bg-gray-200 font-medium",
          card: "bg-black border border-[#333333] shadow-2xl",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "bg-[#1a1a1a] border-[#444444] text-white hover:bg-[#2a2a2a]",
          socialButtonsBlockButtonText: "text-white",
          formFieldInput: "bg-[#1a1a1a] border-[#444444] text-white focus:border-white",
          footerActionLink: "text-white hover:text-gray-300",
          logoBox: "h-12",
          logoImage: "h-12",
          footer: "hidden",
          footerAction: "hidden",
          dividerLine: "bg-[#333333]",
          dividerText: "text-gray-500",
          formFieldLabel: "text-white",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-white",
          rootBox: "mx-auto",
          cardBox: "mx-auto",
          headerBackIcon: "text-white",
          headerBackLink: "text-white",
          otpCodeFieldInput: "border-[#444444] text-white bg-[#1a1a1a]",
          formResendCodeLink: "text-white",
          alternativeMethodsBlockButton: "bg-[#1a1a1a] border-[#444444] text-white hover:bg-[#2a2a2a]",
          badge: "bg-[#1a1a1a] text-white",
          avatarBox: "border-[#333333]",
          userButtonPopoverCard: "bg-black border-[#333333]",
          userButtonPopoverMain: "bg-black",
          userButtonPopoverActions: "bg-black",
          userButtonPopoverActionButton: "text-white hover:bg-[#1a1a1a]",
          userButtonPopoverActionButtonText: "text-white",
          userButtonPopoverActionButtonIcon: "text-white",
          userButtonPopoverFooter: "bg-black border-[#333333]",
          userPreviewMainIdentifier: "text-white",
          userPreviewSecondaryIdentifier: "text-gray-400",
          menuList: "bg-black",
          menuItem: "text-white hover:bg-[#1a1a1a]",
        },
      }}
      localization={{
        signIn: {
          start: {
            title: "Sign in to Atheron",
            subtitle: "Welcome back! Please sign in to continue",
          },
        },
        signUp: {
          start: {
            title: "Create your Atheron account",
            subtitle: "Join Atheron to explore the cosmos",
          },
        },
      }}
    >
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
    </ClerkProvider>
  );
}

