"use client";

export const dynamic = "force-dynamic";

import dynamic from "next/dynamic";

// Use dynamic import with no SSR to prevent server-side rendering issues
const StripeKeysTester = dynamic(
  () => import("@/components/StripeKeysTester"),
  { ssr: false },
);

export default function StripeKeyRotationFixedPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe Key Rotation
      </h1>
      <StripeKeysTester />
    </div>
  );
}
