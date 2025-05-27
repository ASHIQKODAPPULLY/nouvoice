"use client";

import StripeSecretsList from "@/components/StripeSecretsList";

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
