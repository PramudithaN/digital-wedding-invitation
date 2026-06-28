import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Wedding Invitation Manager",
  description: "Manage guest registries, digital invites, RSVPs, and seat tables.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
