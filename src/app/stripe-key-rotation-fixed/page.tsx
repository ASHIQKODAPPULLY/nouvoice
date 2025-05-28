"use client";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Use dynamic import with no SSR to prevent server-side rendering issues
const StripeKeysTester = dynamic(
  () => import("@/components/StripeKeysTester"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 border rounded animate-pulse">
        Loading key tester...
      </div>
    ),
  },
);

export default function StripeKeyRotationFixedPage() {
  return (
    <div className="container mx-auto py-12 px-4 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe Key Rotation
      </h1>
      <Suspense
        fallback={
          <div className="p-4 border rounded animate-pulse">
            Loading key tester...
          </div>
        }
      >
        <StripeKeysTester />
      </Suspense>
    </div>
  );
}
