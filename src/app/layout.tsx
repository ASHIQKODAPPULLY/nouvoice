import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import Script from "next/script";
import { TempoInit } from "./tempo-init";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nouvoice - AI-Powered Invoice Generator",
  description:
    "Generate professional invoices from natural language descriptions",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Script
          src="https://api.tempo.new/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js"
          strategy="beforeInteractive"
        />
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        <TempoInit />
      </body>
    </html>
  );
}
