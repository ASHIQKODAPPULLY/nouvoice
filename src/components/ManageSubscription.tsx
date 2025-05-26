"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface ManageSubscriptionProps {
  hasSubscription: boolean;
}

export default function ManageSubscription({
  hasSubscription = false,
}: ManageSubscriptionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to access billing portal");
      }

      // Redirect to the Stripe Billing Portal
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error accessing billing portal:", error);
      alert("Unable to access billing portal. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={isLoading || !hasSubscription}
      variant={hasSubscription ? "outline" : "secondary"}
      className="w-full md:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {hasSubscription ? "Manage Subscription" : "No Subscription"}
        </>
      )}
    </Button>
  );
}
