"use client";
// Import the dev tools and initialize them
import { useEffect, useState } from "react";

export function TempoInit() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay mounting to ensure DOM is ready
    const mountTimer = setTimeout(() => {
      setMounted(true);
    }, 50);

    return () => clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const init = async () => {
      // Only initialize in browser environment
      if (typeof window === "undefined") return;

      if (process.env.NEXT_PUBLIC_TEMPO) {
        try {
          const { TempoDevtools } = await import("tempo-devtools");
          TempoDevtools.init();
        } catch (error) {
          console.error("Failed to initialize Tempo devtools:", error);
        }
      }
    };

    // Delay initialization to prevent hydration conflicts
    const timeoutId = setTimeout(init, 200);
    return () => clearTimeout(timeoutId);
  }, [mounted]);

  return null;
}
