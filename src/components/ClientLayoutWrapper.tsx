"use client";

import React from "react";
import { Providers } from "@/app/providers";
import { TempoInit } from "@/app/tempo-init";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <TempoInit />
        <main className="flex-1">{children}</main>
      </div>
    </Providers>
  );
}
