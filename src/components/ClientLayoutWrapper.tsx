"use client";

import React, { useEffect, useState } from "react";
import { Providers } from "@/app/providers";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setMounted(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Show a minimal layout during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <Providers>
        <div className="flex flex-col min-h-screen">
          <div className="h-16 border-b bg-background" />{" "}
          {/* Header placeholder */}
          <main className="flex-1">{children}</main>
          <div className="h-32 border-t bg-background" />{" "}
          {/* Footer placeholder */}
        </div>
      </Providers>
    );
  }

  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}
