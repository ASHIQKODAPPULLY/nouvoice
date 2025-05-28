"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface KeyStatusButtonProps {
  loading: boolean;
  onRefresh: () => void;
}

export default function KeyStatusButton({
  loading,
  onRefresh,
}: KeyStatusButtonProps) {
  return (
    <Button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      aria-busy={loading}
      variant="outline"
      className="mr-2"
      aria-label="Refresh status"
    >
      <RefreshCw
        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      Refresh Status
    </Button>
  );
}
