// src/app/layout.tsx
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/auth-context";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import LayoutAuthHandler from "@/components/auth/LayoutHandler";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compatibility Matrix",
  description: "Discover deeper connections with advanced compatibility analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased min-h-screen bg-background font-sans"
        )}
      >
        <AuthProvider>
          <Providers>
            <Suspense fallback={<div>Loading...</div>}>
              <LayoutAuthHandler />
              {children}
            </Suspense>
            <Toaster />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}