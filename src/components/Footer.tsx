"use client";

import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Mail, Heart, ArrowUp, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import NewsletterSignup with no SSR and proper error boundary
const NewsletterSignup = dynamic(() => import("./NewsletterSignup"), {
  ssr: false,
  loading: () => (
    <div className="bg-muted/30 p-6 rounded-lg min-h-[200px] flex items-center justify-center">
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold">Stay Updated</h3>
        <p className="text-sm text-muted-foreground">
          Subscribe to our newsletter for the latest updates, tips, and special
          offers.
        </p>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-muted rounded-md animate-pulse" />
          <div className="w-24 h-10 bg-primary/20 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  ),
});

export default function Footer() {
  const [isClient, setIsClient] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentYear = 2024; // Static year to prevent hydration issues

  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true);
  }, []);

  // Handle scroll to top button visibility
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t bg-background relative">
      {/* Scroll to top button */}
      {isClient && showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 rounded-full shadow-lg z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      <div className="container px-4 md:px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Nouvoice</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered invoice generation for freelancers and small
              businesses.
            </p>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">X</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="mailto:contact@nouvoice.com.au">
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
              <ThemeSwitcher />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8">{isClient && <NewsletterSignup />}</div>

        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Nouvoice. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center mt-2 md:mt-0">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> by
            Nouvoice Team
          </p>
        </div>
      </div>
    </footer>
  );
}
