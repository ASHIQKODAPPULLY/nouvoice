// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

import React from "react";
import dynamic from "next/dynamic";

// Create client-only wrappers using next/dynamic
const EdgeFunctionStatusWrapper = dynamic(
  () => import("@/components/EdgeFunctionDeploymentStatus"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 border rounded animate-pulse">
        Loading deployment status...
      </div>
    ),
  },
);

const StripeKeyErrorWrapper = dynamic(
  () => import("@/components/StripeKeyErrorDisplay"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 border rounded animate-pulse">
        Loading diagnostics...
      </div>
    ),
  },
);

// Use a simple server component that doesn't pass any event handlers
export default function StripeDiagnosticsPage() {
  return (
    <div className="container mx-auto py-12 px-4 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe API Diagnostics
      </h1>

      <div className="mb-8">
        <EdgeFunctionStatusWrapper />
      </div>

      <StripeKeyErrorWrapper />
    </div>
  );
}
