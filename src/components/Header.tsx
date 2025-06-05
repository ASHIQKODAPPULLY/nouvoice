"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const routerPathname = usePathname();

  // Separate useEffect for authentication
  useEffect(() => {
    const supabase = createClient();
    let authSubscription: any;

    const initAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setIsAuthenticated(false);
        } else {
          console.log("Initial session:", !!session);
          setIsAuthenticated(!!session);
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, !!session);
          setIsAuthenticated(!!session);

          // Force a re-render by updating the client state
          if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
            // Small delay to ensure state is properly updated
            setTimeout(() => {
              setIsAuthenticated(!!session);
            }, 100);
          }
        });

        authSubscription = subscription;
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsAuthenticated(false);
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Separate useEffect for client-side setup
  useEffect(() => {
    setIsClient(true);
    setCurrentPath(routerPathname);
  }, [routerPathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);

      // Add/remove class to body for dynamic padding
      if (scrolled) {
        document.body.classList.add("header-scrolled");
      } else {
        document.body.classList.remove("header-scrolled");
      }
    };

    // Set initial state on mount
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("header-scrolled");
    };
  }, []);

  const isLandingPage = currentPath === "/";

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
      } else {
        console.log("Successfully signed out");
        // Redirect to home page after sign out
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header
      className={`border-b fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg border-border/50 h-14"
          : "bg-background/80 backdrop-blur-sm shadow-none border-transparent h-16"
      }`}
    >
      <div
        className={`container mx-auto px-4 flex justify-between items-center transition-all duration-300 ease-in-out ${
          isScrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              width="32"
              height="32"
              className="flex-shrink-0"
            >
              <rect width="100" height="100" rx="20" fill="#2D2A70" />
              <path
                d="M30,70 L30,30 L70,70 L70,30"
                stroke="#00D2FF"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <h1 className="text-xl font-bold">Nouvoice</h1>
          </Link>

          {isClient && (
            <nav className="hidden md:flex items-center space-x-4">
              {!isLandingPage && (
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-primary"
                >
                  Home
                </Link>
              )}

              <Link
                href="/pricing"
                className="text-sm font-medium hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="/support"
                className="text-sm font-medium hover:text-primary"
              >
                Support
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {isClient && !isAuthenticated && (
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => (window.location.href = "/auth/signin")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => (window.location.href = "/auth/signup")}
              >
                {isLandingPage ? "Get Started" : "Sign Up"}
              </Button>
            </div>
          )}
          {isClient && isAuthenticated && (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/pricing")}
              >
                Upgrade to Pro
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          )}
          {isClient && (
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isClient && isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="flex flex-col px-4 py-2 space-y-2">
            {isLandingPage && !isAuthenticated ? (
              <>
                <Link
                  href="/pricing"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/team"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Teams
                </Link>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-2"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.href = "/auth/signin";
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Account</span>
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.href = "/pricing";
                    }}
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              </>
            ) : isLandingPage && isAuthenticated ? (
              <>
                <Link
                  href="/pricing"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/team"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Teams
                </Link>
                <div className="pt-2 space-y-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.href = "/pricing";
                    }}
                  >
                    Upgrade to Pro
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : !isAuthenticated ? (
              <>
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/support"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = "/auth/signin";
                  }}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = "/auth/signup";
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/support"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.href = "/pricing";
                    }}
                  >
                    Upgrade to Pro
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
