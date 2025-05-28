import dynamic from "next/dynamic";

// Dynamically import the client wrapper with SSR disabled
const StripeDiagnosticsClient = dynamic(
  () => import("@/components/StripeDiagnosticsClient"),
  { ssr: false },
);

// Force dynamic rendering to prevent caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function StripeDiagnosticsPage() {
  return <StripeDiagnosticsClient />;
}
