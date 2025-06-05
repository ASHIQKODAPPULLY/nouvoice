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
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after client-side mount
    setIsHydrated(true);
  }, []);

  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        {isHydrated ? (
          <Header />
        ) : (
          <div className="h-16 border-b bg-background flex items-center px-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded" />
              <div className="text-xl font-bold">Nouvoice</div>
            </div>
          </div>
        )}
        <main className="flex-1">{children}</main>
        {isHydrated ? (
          <Footer />
        ) : (
          <div className="h-32 border-t bg-background flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              © 2024 Nouvoice. All rights reserved.
            </div>
          </div>
        )}
      </div>
    </Providers>
  );
}
