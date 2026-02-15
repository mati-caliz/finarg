"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/useStore";
import { Coffee, Crown, LogIn, LogOut, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, subscription, logout } = useAuthStore();
  const { translate } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex-1 min-w-0 ml-12 lg:ml-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary hidden sm:block" />
            <h1 className="text-base sm:text-lg font-semibold truncate">
              {translate("financialPanel")}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {mounted &&
            (isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium max-w-[150px] truncate">{user?.email}</span>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{translate("logout")}</span>
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href="/login" aria-label={translate("login")}>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">{translate("login")}</span>
                </Link>
              </Button>
            ))}
          {mounted && subscription && subscription.plan === "FREE" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-950 hover:text-yellow-700 dark:hover:text-yellow-400"
              asChild
            >
              <Link href="/planes">
                <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                <span>Premium</span>
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hidden sm:flex border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-700 dark:hover:text-amber-400"
            asChild
          >
            <a href="https://cafecito.app/finlatam" target="_blank" rel="noopener noreferrer">
              <Coffee className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <span>{translate("buyCoffee")}</span>
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 sm:hidden border-amber-200 dark:border-amber-800"
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
        </div>
      </div>
    </header>
  );
}
