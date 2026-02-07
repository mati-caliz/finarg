"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
// import { useAuthStore } from "@/store/useStore";
// import { Bell, LogOut } from "lucide-react";
// import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [/*mounted*/ , setMounted] = useState(false);
  // const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex-1 min-w-0 ml-12 lg:ml-0">
          <h1 className="text-base sm:text-lg font-semibold truncate">Panel Financiero</h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-2 hidden sm:flex" asChild>
            <a href="https://cafecito.app/finlatam" target="_blank" rel="noopener noreferrer">
              <Coffee className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <span>Invitame un cafecito</span>
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 sm:hidden"
            aria-label="Invitame un cafecito"
            asChild
          >
            <a
              href="https://cafecito.app/finlatam"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <Coffee className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </a>
          </Button>
          <ThemeToggle />
          {/* <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Iniciar Sesion</Link>
            </Button>
          )} */}
        </div>
      </div>
    </header>
  );
}
