import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";
import RootLayoutContent from "@/components/RootLayoutContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mocksy - Idea to concept in seconds",
  description: "Turn your app or game idea into visual concepts instantly. AI-powered mockups, icons, and screenshots.",
  openGraph: {
    title: "Mocksy - Idea to concept in seconds",
    description: "Turn your app or game idea into visual concepts instantly. AI-powered mockups, icons, and screenshots.",
    images: [
      {
        url: "/mocksy_cover.jpg",
        width: 1200,
        height: 630,
        alt: "Mocksy - Idea to concept in seconds",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mocksy - Idea to concept in seconds",
    description: "Turn your app or game idea into visual concepts instantly. AI-powered mockups, icons, and screenshots.",
    images: ["/mocksy_cover.jpg"],
  },
  icons: {
    icon: "/mocksy-app-icon.png",
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
        <Providers>
          <RootLayoutContent>
            {children}
          </RootLayoutContent>
        </Providers>
      </body>
    </html>
  );
}
