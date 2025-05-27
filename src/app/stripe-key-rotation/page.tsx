"use client";

import StripeKeysTester from "@/components/StripeKeysTester";

export default function StripeKeyRotationPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe Key Rotation
      </h1>
      <StripeKeysTester />
    </div>
  );
}
