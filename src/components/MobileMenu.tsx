import * as React from "react";
import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "../lib/utils";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="md:hidden p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-black focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <XIcon className="h-6 w-6" />
        ) : (
          <MenuIcon className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 bg-white rounded shadow-md p-4">
          <Link href="/" className="block text-sm font-medium text-gray-700">
            Home
          </Link>
          <Link
            href="/about"
            className="block text-sm font-medium text-gray-700"
          >
            About
          </Link>
          <Link
            href="/pricing"
            className="block text-sm font-medium text-gray-700"
          >
            Pricing
          </Link>
          <Link
            href="/support"
            className="block text-sm font-medium text-gray-700"
          >
            Support
          </Link>
        </div>
      )}
    </nav>
  );
}
