"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Coffee, Sparkles } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const { translate } = useTranslation();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex-1 min-w-0 ml-12 lg:ml-0">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
          >
            <Sparkles className="h-4 w-4 text-primary hidden sm:block" />
            <h1 className="text-base sm:text-lg font-semibold truncate">
              {translate("financialPanel")}
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
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
