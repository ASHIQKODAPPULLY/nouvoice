"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="border-b sticky top-0 z-[100] bg-background">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            {isLandingPage ? (
              <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">I</span>
              </div>
            ) : (
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
            )}
            <h1 className="text-xl font-bold">Nouvoice</h1>
          </Link>

          {!isLandingPage && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-sm font-medium hover:text-primary">
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium hover:text-primary"
              >
                About
              </Link>
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
          {!isLandingPage && (
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
                Sign Up
              </Button>
            </div>
          )}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="flex flex-col px-4 py-2 space-y-2">
            {isLandingPage ? (
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
                  href="/about"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
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
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
