"use client";

export const dynamic = "force-dynamic";

import dynamic from "next/dynamic";

// Use dynamic import with no SSR to prevent server-side rendering issues
const StripeSecretsList = dynamic(
  () => import("@/components/StripeSecretsList"),
  { ssr: false },
);

export default function StripeSecretsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe API Secrets
      </h1>
      <StripeSecretsList />
    </div>
  );
}
