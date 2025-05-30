"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  Menu as MenuIcon,
  X,
  Home,
  FileText,
  Clock,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Create Invoice", path: "/mobile#create", icon: FileText },
    { name: "Invoice History", path: "/mobile#history", icon: Clock },
    { name: "Settings", path: "/mobile#settings", icon: Settings },
    { name: "Account", path: "/account", icon: User },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-12 w-12 touch-manipulation"
        >
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-gradient-to-r from-gradient-blue to-gradient-purple flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <h1 className="text-xl font-bold">Nouvoice</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 touch-manipulation"
              onClick={() => setOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <nav className="flex-1 py-2 overflow-y-auto">
            <ul className="space-y-1">
              {routes.map((route) => {
                const isActive =
                  pathname === route.path ||
                  (pathname.includes("/mobile") &&
                    route.path.includes("/mobile#"));
                const Icon = route.icon;
                return (
                  <li key={route.path}>
                    <Link
                      href={route.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 text-base rounded-md hover:bg-muted touch-manipulation ${isActive ? "bg-muted font-medium" : ""}`}
                    >
                      <Icon className="h-5 w-5 min-w-5" />
                      <span className="truncate">{route.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t p-4">
            <Button className="w-full h-12 text-base bg-gradient-to-r from-gradient-blue to-gradient-purple hover:opacity-90 touch-manipulation">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
