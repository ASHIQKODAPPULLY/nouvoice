"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error) {
          console.error("Failed to exchange code:", error.message);
          alert("There was a problem verifying your email.");
        } else {
          router.push("/"); // Redirect to homepage after successful verification
        }
      } catch (err) {
        console.error("Authentication error:", err);
        alert("An unexpected error occurred during verification.");
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
