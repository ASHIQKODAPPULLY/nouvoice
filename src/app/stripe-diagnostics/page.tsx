"use client";

import React from "react";
import EdgeFunctionDeploymentStatus from "@/components/EdgeFunctionDeploymentStatus";
import StripeKeyErrorDisplay from "@/components/StripeKeyErrorDisplay";

export default function StripeDiagnosticsPage() {
  return (
    <div className="container mx-auto py-12 px-4 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe API Diagnostics
      </h1>

      <div className="mb-8">
        <EdgeFunctionDeploymentStatus />
      </div>

      <StripeKeyErrorDisplay />
    </div>
  );
}
