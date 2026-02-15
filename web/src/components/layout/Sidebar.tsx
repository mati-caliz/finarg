"use client";

import { GoogleAd } from "@/components/GoogleAd";
import { Button } from "@/components/ui/button";
import { getCountryConfig } from "@/config/countries";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useStore";
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart2,
  Calculator,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CreditCard,
  DollarSign,
  Gauge,
  Landmark,
  LayoutDashboard,
  LineChart,
  Menu,
  Newspaper,
  Percent,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavigationItem {
  key: TranslationKey;
  href: string;
  icon: React.ElementType;
  feature: "quotes" | "inflation" | "reserves" | "rates" | "incomeTax" | null;
  isNew?: boolean;
  isComingSoon?: boolean;
}

interface NavigationCategory {
  key: TranslationKey;
  icon: React.ElementType;
  items: NavigationItem[];
}

const baseNavigationCategories: (NavigationItem | NavigationCategory)[] = [
  {
    key: "dashboard" as TranslationKey,
    href: "/",
    icon: LayoutDashboard,
    feature: null,
  },
  {
    key: "market" as TranslationKey,
    icon: DollarSign,
    items: [
      {
        key: "quotes" as TranslationKey,
        href: "/cotizaciones",
        icon: LineChart,
        feature: "quotes" as const,
      },
      {
        key: "exchangeBands" as TranslationKey,
        href: "/bandas-cambiarias",
        icon: Gauge,
        feature: "quotes" as const,
      },
      {
        key: "exchangeRatesComparator" as TranslationKey,
        href: "/conversor-monedas",
        icon: ArrowLeftRight,
        feature: "quotes" as const,
      },
      {
        key: "ratesComparator" as TranslationKey,
        href: "/comparador-tasas",
        icon: BarChart2,
        feature: "rates" as const,
      },
      {
        key: "investmentsTitle" as TranslationKey,
        href: "/inversiones",
        icon: TrendingUp,
        feature: null,
      },
    ],
  },
  {
    key: "indicators" as TranslationKey,
    icon: LineChart,
    items: [
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
        key: "countryRisk" as TranslationKey,
        href: "/riesgo-pais",
        icon: AlertTriangle,
        feature: null,
      },
      {
        key: "news" as TranslationKey,
        href: "/noticias-financieras-argentina",
        icon: Newspaper,
        feature: null,
      },
      {
        key: "holidays" as TranslationKey,
        href: "/feriados",
        icon: CalendarDays,
        feature: null,
      },
    ],
  },
  {
    key: "calculators" as TranslationKey,
    icon: Calculator,
    items: [
      {
        key: "incomeTaxCalculator" as TranslationKey,
        href: "/calculadora-sueldo-neto",
        icon: Calculator,
        feature: "incomeTax" as const,
      },
      {
        key: "compoundInterestCalculator" as TranslationKey,
        href: "/calculadora-interes-compuesto",
        icon: TrendingUp,
        feature: null,
      },
      {
        key: "adjustmentCalculator" as TranslationKey,
        href: "/calculadora-ajuste-inflacion",
        icon: Percent,
        feature: "inflation" as const,
      },
      {
        key: "installmentsVsCashCalculator" as TranslationKey,
        href: "/calculadora-cuotas-contado",
        icon: CreditCard,
        feature: null,
      },
    ],
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
      <div className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
        <span className="text-lg">{countryConfig.flag}</span>
        <span className="text-white/90">{translate(countryConfig.code as TranslationKey)}</span>
      </div>
      <p className="text-xs text-white/40 px-1">{translate("otherCountriesComingSoon")}</p>
    </div>
  );
}

interface NavItemProps {
  item: NavigationItem;
  pathname: string;
  toggleSidebar: () => void;
  translate: (key: TranslationKey) => string;
  selectedCountry: string;
  reservesKeyMap: Record<string, TranslationKey>;
}

function NavItem({
  item,
  pathname,
  toggleSidebar,
  translate,
  selectedCountry,
  reservesKeyMap,
}: NavItemProps) {
  const isActive = pathname === item.href;
  const isComingSoon = item.isComingSoon || item.href === "#";
  const displayName =
    item.feature === "reserves"
      ? translate(reservesKeyMap[selectedCountry] || "reserves")
      : translate(item.key);

  return (
    <Link
      href={item.href}
      onClick={(e) => {
        if (isComingSoon) {
          e.preventDefault();
          return;
        }
        if (window.innerWidth < 1024) {
          toggleSidebar();
        }
      }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
        isActive
          ? "bg-[hsl(152_69%_24%)] text-white shadow-lg shadow-primary/25"
          : "text-white/60 hover:bg-white/10 hover:text-white",
        isComingSoon && "cursor-default",
      )}
    >
      <item.icon className={cn("h-5 w-5 shrink-0", isComingSoon && "opacity-50")} />
      <span className={cn("flex-1", isComingSoon && "opacity-50")}>{displayName}</span>
      {item.isNew && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-green-700 text-white uppercase tracking-wide">
          Nuevo
        </span>
      )}
      {isComingSoon && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-700 text-white uppercase tracking-wide">
          {translate("comingSoon")}
        </span>
      )}
    </Link>
  );
}

interface NavCategoryProps {
  category: NavigationCategory;
  pathname: string;
  toggleSidebar: () => void;
  translate: (key: TranslationKey) => string;
  selectedCountry: string;
  countryConfig: ReturnType<typeof getCountryConfig>;
  reservesKeyMap: Record<string, TranslationKey>;
}

function NavCategory({
  category,
  pathname,
  toggleSidebar,
  translate,
  selectedCountry,
  countryConfig,
  reservesKeyMap,
}: NavCategoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = category.items.filter((item) => {
    if (!item.feature) {
      return true;
    }
    return countryConfig.features[item.feature];
  });

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold text-white/70 hover:text-white/90 hover:bg-white/5 rounded-lg transition-all duration-200"
        type="button"
      >
        <category.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{translate(category.key)}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="ml-2 space-y-0.5 border-l border-white/10 pl-2">
          {filteredItems.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              pathname={pathname}
              toggleSidebar={toggleSidebar}
              translate={translate}
              selectedCountry={selectedCountry}
              reservesKeyMap={reservesKeyMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, setSidebarOpen, selectedCountry } = useAppStore();
  const countryConfig = getCountryConfig(selectedCountry);
  const { translate } = useTranslation();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleResize = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 1024) {
          setSidebarOpen(true);
        } else {
          setSidebarOpen(false);
        }
      }, 150);
    };

    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [setSidebarOpen]);

  const reservesKeyMap: Record<string, TranslationKey> = {
    ar: "bcraReserves",
    co: "banrepReserves",
    br: "bcbReserves",
    cl: "bcchReserves",
    uy: "bcuReserves",
  };

  const isCategory = (item: NavigationItem | NavigationCategory): item is NavigationCategory => {
    return "items" in item;
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
          onKeyDown={(e) => e.key === "Enter" && toggleSidebar()}
          role="button"
          tabIndex={0}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--sidebar-start)) 0%, hsl(var(--sidebar-end)) 100%)",
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-white/10">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Ir al inicio">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-white">FinLatam</span>
            </Link>
          </div>

          <div className="p-4 border-b border-white/10">
            <CountrySelector />
          </div>

          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {baseNavigationCategories.map((item) => {
              if (isCategory(item)) {
                return (
                  <NavCategory
                    key={item.key}
                    category={item}
                    pathname={pathname}
                    toggleSidebar={toggleSidebar}
                    translate={translate}
                    selectedCountry={selectedCountry}
                    countryConfig={countryConfig}
                    reservesKeyMap={reservesKeyMap}
                  />
                );
              }

              if (!item.feature || countryConfig.features[item.feature]) {
                return (
                  <NavItem
                    key={item.key}
                    item={item}
                    pathname={pathname}
                    toggleSidebar={toggleSidebar}
                    translate={translate}
                    selectedCountry={selectedCountry}
                    reservesKeyMap={reservesKeyMap}
                  />
                );
              }

              return null;
            })}
          </nav>

          <div className="px-3 pb-3">
            <GoogleAd
              adSlot="9876543210"
              adFormat="auto"
              style={{ minHeight: "250px", maxWidth: "100%" }}
            />
          </div>

          <div className="border-t border-white/10 p-4">
            <p className="text-xs text-white/40 text-center">{translate("footerVersion")}</p>
            <p className="text-xs text-white/40 text-center mt-1">
              {countryConfig.flag} {countryConfig.shortName}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
