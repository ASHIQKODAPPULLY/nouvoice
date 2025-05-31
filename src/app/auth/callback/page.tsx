"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log("Starting auth callback process");
        const supabase = createClient();

        // Log the current URL for debugging
        console.log("Current URL:", window.location.href);

        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error) {
          console.error("Failed to exchange code:", error.message);
          alert(
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
        alert(
          "An unexpected error occurred during verification. Please try again.",
        );
        // Redirect to sign-in page after error
        setTimeout(() => router.push("/auth/signin"), 2000);
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-center text-lg">Verifying your account...</p>
    </div>
  );
}
