"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isBrowser } from "@/lib/environment";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (!isBrowser) return; // Only run in browser

        console.log("Starting auth callback process");
        // Import dynamically to avoid SSR issues
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Log the current URL for debugging
        console.log("Current URL:", window.location.href);

        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error) {
          console.error("Failed to exchange code:", error.message);
          setError(
            "There was a problem verifying your email. Please try signing up again.",
          );
          // Redirect to sign-in page after error
          setTimeout(() => router.push("/auth/signin"), 2000);
        } else {
          console.log("Successfully verified email and created session");
          router.push("/"); // Redirect to homepage after successful verification
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError(
          "An unexpected error occurred during verification. Please try again.",
        );
        // Redirect to sign-in page after error
        setTimeout(() => router.push("/auth/signin"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      {isLoading ? (
        <p className="text-center text-lg">Verifying your account...</p>
      ) : error ? (
        <p className="text-center text-lg text-red-500">{error}</p>
      ) : (
        <p className="text-center text-lg">
          Verification successful! Redirecting...
        </p>
      )}
    </div>
  );
}
