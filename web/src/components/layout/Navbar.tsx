"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Coffee } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-30 h-16 backdrop-blur-xl"
      style={{
        borderBottom: "1px solid var(--border-1)",
        background: "color-mix(in srgb, var(--bg-page) 82%, transparent)",
      }}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex-1 min-w-0 ml-12 lg:ml-0">
          <Link
            href="/"
            className="w-fit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--text-secondary)",
              fontSize: "0.9375rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <span
              className="lg:hidden"
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              La
              <span
                style={{ width: 3, height: 16, background: "var(--brecha)", borderRadius: 2 }}
              />
              Brecha
            </span>
            <span className="hidden lg:inline">Observatorio político-económico</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://cafecito.app/finlatam"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-2)",
              background: "var(--surface-card)",
              color: "var(--brecha-strong)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">Invitame un café</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
