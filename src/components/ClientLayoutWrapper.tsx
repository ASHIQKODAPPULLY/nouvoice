"use client";

import React from "react";
import { Providers } from "@/app/providers";
import { TempoInit } from "@/app/tempo-init";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Header />
        <TempoInit />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}
