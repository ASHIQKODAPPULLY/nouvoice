"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Mark as hydrated after client-side mount
    setIsHydrated(true);
  }, []);

  const ICON_SIZE = 16;

  // Always render consistent structure
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"} className="w-10 h-10">
          {isHydrated ? (
            theme === "light" ? (
              <Sun
                key="light"
                size={ICON_SIZE}
                className={"text-muted-foreground"}
              />
            ) : theme === "dark" ? (
              <Moon
                key="dark"
                size={ICON_SIZE}
                className={"text-muted-foreground"}
              />
            ) : (
              <Laptop
                key="system"
                size={ICON_SIZE}
                className={"text-muted-foreground"}
              />
            )
          ) : (
            <Sun size={ICON_SIZE} className={"text-muted-foreground"} />
          )}
        </Button>
      </DropdownMenuTrigger>
      {isHydrated && (
        <DropdownMenuContent className="w-content" align="start">
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(e) => setTheme(e)}
          >
            <DropdownMenuRadioItem className="flex gap-2" value="light">
              <Sun size={ICON_SIZE} className="text-muted-foreground" />{" "}
              <span>Light</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="flex gap-2" value="dark">
              <Moon size={ICON_SIZE} className="text-muted-foreground" />{" "}
              <span>Dark</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="flex gap-2" value="system">
              <Laptop size={ICON_SIZE} className="text-muted-foreground" />{" "}
              <span>System</span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
