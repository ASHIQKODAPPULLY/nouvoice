import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../providers";
import Script from "next/script";
import { TempoInit } from "../tempo-init";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nouvoice Mobile - AI-Powered Invoice Generator",
  description: "Generate professional invoices on the go",
};

export default function MobileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempo.new/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className}>
        <Providers>
          {children}
          <TempoInit />
        </Providers>
      </body>
    </html>
  );
}
