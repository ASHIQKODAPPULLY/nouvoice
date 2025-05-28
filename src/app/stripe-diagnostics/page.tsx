"use client";

import React from "react";
import EdgeFunctionDeploymentStatus from "@/components/EdgeFunctionDeploymentStatus";
import StripeKeyErrorDisplay from "@/components/StripeKeyErrorDisplay";
import StripeKeysTester from "@/components/StripeKeysTester";
import StripeWebhookTester from "@/components/StripeWebhookTester";

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function StripeDiagnosticsPage() {
  return (
    <div className="container mx-auto py-12 px-4 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe API Diagnostics
        <span className="text-xs text-gray-500 block mt-2">
          Last updated: {new Date().toLocaleString()}
        </span>
      </h1>

      <div className="mb-8">
        <EdgeFunctionDeploymentStatus />
      </div>

      <div className="mb-8">
        <StripeKeysTester />
      </div>

      <div className="mb-8">
        <StripeKeyErrorDisplay />
      </div>

      <div className="mb-8">
        <StripeWebhookTester />
      </div>
    </div>
  );
}
