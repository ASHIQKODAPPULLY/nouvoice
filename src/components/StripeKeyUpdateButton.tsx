"use client";

import { Button } from "@/components/ui/button";

interface StripeKeyUpdateButtonProps {
  rotatingKey: boolean;
  newSecretKey: string;
  onUpdate: () => void;
}

export default function StripeKeyUpdateButton({
  rotatingKey,
  newSecretKey,
  onUpdate,
}: StripeKeyUpdateButtonProps) {
  return (
    <Button
      type="button"
      onClick={onUpdate}
      disabled={rotatingKey || !newSecretKey}
      aria-busy={rotatingKey}
      aria-label="Update Stripe secret key"
      className="w-full"
    >
      {rotatingKey ? "Updating..." : "Update Stripe Secret Key"}
    </Button>
  );
}
