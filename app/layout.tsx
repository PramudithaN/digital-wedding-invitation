import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import ThemeRegistry from "@/components/ThemeRegistry";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const bohemeFloral = localFont({
  src: "../public/fonts/Boheme Floral.ttf",
  variable: "--font-boheme-floral",
});

const miracleWorld = localFont({
  src: "../public/fonts/Miracle World.otf",
  variable: "--font-miracle-world",
});

export const metadata: Metadata = {
  title: "Digital Wedding Invitation Manager",
  description: "Manage guest registries, digital invites, RSVPs, and seat tables.",
  icons: {
    icon: "/Logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${bohemeFloral.variable} ${miracleWorld.variable} h-full`}>
      <body className="min-h-full">
        <ThemeRegistry>{children}</ThemeRegistry>
        <Analytics />
      </body>
    </html>
  );
}
