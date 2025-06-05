"use client";
// Import the dev tools and initialize them
import { useEffect, useState } from "react";

export function TempoInit() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag after hydration
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const init = async () => {
      // Double check we're in browser environment
      if (typeof window === "undefined") return;

      // Add additional delay to ensure all components are hydrated
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (process.env.NEXT_PUBLIC_TEMPO) {
        try {
          const { TempoDevtools } = await import("tempo-devtools");
          TempoDevtools.init();
        } catch (error) {
          console.error("Failed to initialize Tempo devtools:", error);
        }
      }
    };

    init();
  }, [isClient]);

  return null;
}
