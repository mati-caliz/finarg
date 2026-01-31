'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  Calculator,
  TrendingUp,
  ArrowLeftRight,
  Percent,
  Landmark,
  PiggyBank,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { COUNTRIES_LIST, getCountryConfig, CountryCode } from '@/config/countries';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n/translations';

const baseNavigation = [
  { key: 'dashboard' as TranslationKey, href: '/', icon: LayoutDashboard, feature: null },
  { key: 'quotes' as TranslationKey, href: '/cotizaciones', icon: DollarSign, feature: 'quotes' as const },
  { key: 'incomeTaxCalculator' as TranslationKey, href: '/ganancias', icon: Calculator, feature: 'incomeTax' as const },
  { key: 'simulator' as TranslationKey, href: '/simulador', icon: TrendingUp, feature: 'simulator' as const },
  { key: 'arbitrage' as TranslationKey, href: '/arbitraje', icon: ArrowLeftRight, feature: 'arbitrage' as const },
  { key: 'inflation' as TranslationKey, href: '/inflacion', icon: Percent, feature: 'inflation' as const },
  { key: 'reserves' as TranslationKey, href: '/reservas', icon: Landmark, feature: 'reserves' as const },
  { key: 'repos' as TranslationKey, href: '/cauciones', icon: PiggyBank, feature: 'repos' as const },
];

function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const countryConfig = getCountryConfig(selectedCountry);
  const { translate } = useTranslation();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{countryConfig.flag}</span>
          <span>{translate(countryConfig.code as TranslationKey)}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50">
          {COUNTRIES_LIST.map((country) => (
            <button
              key={country.code}
              onClick={() => {
                setSelectedCountry(country.code as CountryCode);
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                selectedCountry === country.code && "bg-primary/10 text-primary"
              )}
            >
              <span className="text-lg">{country.flag}</span>
              <span>{translate(country.code as TranslationKey)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, selectedCountry } = useAppStore();
  const countryConfig = getCountryConfig(selectedCountry);
  const { translate } = useTranslation();

  const reservesKeyMap: Record<string, TranslationKey> = {
    ar: 'bcraReserves',
    co: 'banrepReserves',
    br: 'bcbReserves',
    cl: 'bcchReserves',
    uy: 'bcuReserves',
  };

  const navigation = baseNavigation
    .filter(item => {
      if (!item.feature) {
        return true;
      }
      return countryConfig.features[item.feature];
    })
    .map(item => ({
      ...item,
      name: item.feature === 'reserves' 
        ? translate(reservesKeyMap[selectedCountry] || 'reserves')
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
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 transform bg-card border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
              {translate('footerVersion')}
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
