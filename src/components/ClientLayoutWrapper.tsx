"use client";

import React from "react";
import { Providers } from "@/app/providers";
import { TempoInit } from "@/app/tempo-init";
import Footer from "./Footer";
import MobileMenu from "./MobileMenu";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <TempoInit />
        <div className="fixed top-0 right-0 z-50">
          <MobileMenu />
        </div>
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}
