"use client";

import StripeKeyRotation from "@/components/StripeKeyRotation";

export default function StripeKeyRotationNewPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe Key Rotation Management
      </h1>
      <StripeKeyRotation />
    </div>
  );
}
