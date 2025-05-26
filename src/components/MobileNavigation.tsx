"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, X, Home, FileText, Clock, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    { name: "Home", path: "/", icon: Home },
    { name: "Create Invoice", path: "/#create", icon: FileText },
    { name: "Invoice History", path: "/#history", icon: Clock },
    { name: "Pricing", path: "/pricing", icon: Settings },
    { name: "Account", path: "/account", icon: User },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-r from-gradient-blue to-gradient-purple flex items-center justify-center">
                <span className="text-white font-bold">I</span>
              </div>
              <h1 className="text-xl font-bold">Nouvoice</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <nav className="flex-1 py-4">
            <ul className="space-y-2">
              {routes.map((route) => {
                const isActive = pathname === route.path;
                const Icon = route.icon;
                return (
                  <li key={route.path}>
                    <Link
                      href={route.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-base rounded-md hover:bg-muted ${isActive ? "bg-muted font-medium" : ""}`}
                    >
                      <Icon className="h-5 w-5" />
                      {route.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t py-4">
            <Button className="w-full bg-gradient-to-r from-gradient-blue to-gradient-purple hover:opacity-90">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
