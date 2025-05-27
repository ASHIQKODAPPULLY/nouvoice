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
      onClick={onUpdate}
      disabled={rotatingKey || !newSecretKey}
      className="w-full"
    >
      {rotatingKey ? "Updating..." : "Update Stripe Secret Key"}
    </Button>
  );
}
