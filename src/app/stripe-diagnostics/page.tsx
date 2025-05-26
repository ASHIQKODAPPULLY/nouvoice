"use client";

import StripeKeyErrorDisplay from "@/components/StripeKeyErrorDisplay";
import EdgeFunctionDeploymentStatus from "@/components/EdgeFunctionDeploymentStatus";

export default function StripeDiagnosticsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
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
