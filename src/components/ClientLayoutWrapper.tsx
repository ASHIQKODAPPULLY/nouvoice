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
    setMounted(true);
  }, []);

  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        {mounted && <Header />}
        <main className="flex-1">{children}</main>
        {mounted && <Footer />}
      </div>
    </Providers>
  );
}
