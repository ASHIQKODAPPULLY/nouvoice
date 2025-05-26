"use client";

import dynamic from "next/dynamic";

// Dynamically import the fine-tuning admin component with error handling
const FineTuningAdmin = dynamic(
  () =>
    import("@/components/ui/fine-tuning-admin").catch(() => {
      // Fallback component if import fails
      return () => <div>Fine-tuning admin component not found</div>;
    }),
  { ssr: false, loading: () => <div>Loading fine-tuning admin...</div> },
);

export default function FineTuningAdminPage() {
  return <FineTuningAdmin />;
}
