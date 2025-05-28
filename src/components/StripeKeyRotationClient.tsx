"use client";

import React from "react";
import StripeKeysTester from "@/components/StripeKeysTester";

export default function StripeKeyRotationClient() {
  return (
    <div className="container mx-auto py-12 px-4 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe Key Rotation Tool
      </h1>

      <div className="mb-8">
        <StripeKeysTester />
      </div>
    </div>
  );
}
