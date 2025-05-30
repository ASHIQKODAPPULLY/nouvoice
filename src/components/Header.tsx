"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";
import { Home, Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b sticky top-0 z-10 bg-background">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-gradient-blue to-gradient-purple flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <h1 className="text-xl font-bold">Nouvoice</h1>
          </Link>

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
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="hidden md:block">
            <Link href="/auth/signin">
              <Button variant="outline" size="sm" className="mr-2">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
