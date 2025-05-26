"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, Smartphone } from "lucide-react";
import Link from "next/link";

export default function MobileAppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user is on mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on initial load
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Show banner after a delay if on desktop
    const timer = setTimeout(() => {
      if (!window.localStorage.getItem("mobileAppBannerDismissed")) {
        setIsVisible(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const dismissBanner = () => {
    setIsVisible(false);
    window.localStorage.setItem("mobileAppBannerDismissed", "true");
  };

  if (!isVisible || isMobile) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-card border shadow-lg rounded-lg p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="bg-gradient-to-r from-gradient-blue to-gradient-purple p-2 rounded-md">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium mb-1">Try our mobile app</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Create invoices on the go with our mobile-optimized experience
          </p>
          <div className="flex gap-2">
            <Link href="/mobile" className="flex-1">
              <Button size="sm" className="w-full">
                Open Mobile App
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={dismissBanner}
              className="flex-shrink-0"
            >
              Dismiss
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={dismissBanner}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
