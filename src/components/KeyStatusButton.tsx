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
      onClick={onRefresh}
      disabled={loading}
      variant="outline"
      className="mr-2"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Refresh Status
    </Button>
  );
}
