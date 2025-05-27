"use client";

export const dynamic = "force-dynamic";

import dynamic from "next/dynamic";

// Use dynamic import with no SSR to prevent server-side rendering issues
const StripeKeyErrorDisplay = dynamic(
  () => import("@/components/StripeKeyErrorDisplay"),
  { ssr: false },
);

const EdgeFunctionDeploymentStatus = dynamic(
  () => import("@/components/EdgeFunctionDeploymentStatus"),
  { ssr: false },
);

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
