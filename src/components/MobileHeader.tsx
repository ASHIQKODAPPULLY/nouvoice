"use client";

import { ThemeSwitcher } from "./theme-switcher";
import MobileNavigation from "./MobileNavigation";
import Link from "next/link";

export default function MobileHeader() {
  return (
    <header className="border-b sticky top-0 z-10 bg-background">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-gradient-blue to-gradient-purple flex items-center justify-center">
              <span className="text-white font-bold">I</span>
            </div>
            <h1 className="text-xl font-bold">Nouvoice</h1>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
