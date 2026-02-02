"use client";

import { Button } from "@/components/ui/button";
import { getCountryConfig } from "@/config/countries";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useStore";
import {
  ArrowLeftRight,
  BarChart2,
  Calculator,
  DollarSign,
  Gauge,
  Landmark,
  LayoutDashboard,
  Menu,
  Percent,
  PiggyBank,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const baseNavigation = [
  { key: "dashboard" as TranslationKey, href: "/", icon: LayoutDashboard, feature: null },
  {
    key: "quotes" as TranslationKey,
    href: "/cotizaciones",
    icon: DollarSign,
    feature: "quotes" as const,
  },
  {
    key: "exchangeBands" as TranslationKey,
    href: "/bandas-cambiarias",
    icon: Gauge,
    feature: "quotes" as const,
  },
  {
    key: "inflation" as TranslationKey,
    href: "/inflacion",
    icon: Percent,
    feature: "inflation" as const,
  },
  {
    key: "reserves" as TranslationKey,
    href: "/reservas-bcra",
    icon: Landmark,
    feature: "reserves" as const,
  },
  {
    key: "ratesComparator" as TranslationKey,
    href: "/comparador-tasas",
    icon: BarChart2,
    feature: "rates" as const,
  },
  {
    key: "incomeTaxCalculator" as TranslationKey,
    href: "/calculadora-sueldo-neto",
    icon: Calculator,
    feature: "incomeTax" as const,
  },
  {
    key: "investmentSimulator" as TranslationKey,
    href: "/simulador-de-inversiones",
    icon: TrendingUp,
    feature: "simulator" as const,
  },
  {
    key: "arbitrage" as TranslationKey,
    href: "/arbitraje",
    icon: ArrowLeftRight,
    feature: "arbitrage" as const,
  },
  {
    key: "repos" as TranslationKey,
    href: "/cauciones",
    icon: PiggyBank,
    feature: "repos" as const,
  },
];

function CountrySelector() {
  const { setSelectedCountry } = useAppStore();
  const countryConfig = getCountryConfig("ar");
  const { translate } = useTranslation();

  useEffect(() => {
    setSelectedCountry("ar");
  }, [setSelectedCountry]);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-muted">
        <span className="text-lg">{countryConfig.flag}</span>
        <span>{translate(countryConfig.code as TranslationKey)}</span>
      </div>
      <p className="text-xs text-muted-foreground px-1">{translate("otherCountriesComingSoon")}</p>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, selectedCountry } = useAppStore();
  const countryConfig = getCountryConfig(selectedCountry);
  const { translate } = useTranslation();

  const reservesKeyMap: Record<string, TranslationKey> = {
    ar: "bcraReserves",
    co: "banrepReserves",
    br: "bcbReserves",
    cl: "bcchReserves",
    uy: "bcuReserves",
  };

  const navigation = baseNavigation
    .filter((item) => {
      if (!item.feature) {
        return true;
      }
      return countryConfig.features[item.feature];
    })
    .map((item) => ({
      ...item,
      name:
        item.feature === "reserves"
          ? translate(reservesKeyMap[selectedCountry] || "reserves")
          : translate(item.key),
    }));

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
          onKeyDown={(e) => e.key === "Enter" && toggleSidebar()}
          role="button"
          tabIndex={0}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform bg-card border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">FinLatam</span>
            </Link>
          </div>

          <div className="p-4 border-b border-border">
            <CountrySelector />
          </div>

          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <p className="text-xs text-muted-foreground text-center">
              {translate("footerVersion")}
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {countryConfig.flag} {countryConfig.shortName}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
