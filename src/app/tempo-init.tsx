"use client";
// Import the dev tools and initialize them
import { useEffect, useState } from "react";

export function TempoInit() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const init = async () => {
      if (process.env.NEXT_PUBLIC_TEMPO) {
        try {
          const { TempoDevtools } = await import("tempo-devtools");
          TempoDevtools.init();
        } catch (error) {
          console.error("Failed to initialize Tempo devtools:", error);
        }
      }
    };

    const timeoutId = setTimeout(init, 100);
    return () => clearTimeout(timeoutId);
  }, [mounted]);

  return null;
}
