"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Use dynamic import with no SSR to prevent server-side rendering issues
const StripeSecretsList = dynamic(
  () => import("@/components/StripeSecretsList"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 border rounded animate-pulse">
        Loading secrets list...
      </div>
    ),
  },
);

export default function StripeSecretsPage() {
  return (
    <div className="container mx-auto py-12 px-4 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe API Secrets
      </h1>
      <Suspense
        fallback={
          <div className="p-4 border rounded animate-pulse">
            Loading secrets list...
          </div>
        }
      >
        <StripeSecretsList />
      </Suspense>
    </div>
  );
}
