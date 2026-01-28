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

const baseNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, feature: null },
  { name: 'Quotes', href: '/cotizaciones', icon: DollarSign, feature: 'quotes' as const },
  { name: 'Income Tax Calculator', href: '/ganancias', icon: Calculator, feature: 'incomeTax' as const },
  { name: 'Simulator', href: '/simulador', icon: TrendingUp, feature: 'simulator' as const },
  { name: 'Arbitrage', href: '/arbitraje', icon: ArrowLeftRight, feature: 'arbitrage' as const },
  { name: 'Inflation', href: '/inflacion', icon: Percent, feature: 'inflation' as const },
  { name: 'Reserves', href: '/reservas', icon: Landmark, feature: 'reserves' as const },
  { name: 'Repos', href: '/cauciones', icon: PiggyBank, feature: 'repos' as const },
];

function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const countryConfig = getCountryConfig(selectedCountry);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{countryConfig.flag}</span>
          <span>{countryConfig.name}</span>
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
              <span>{country.name}</span>
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

  const navigation = baseNavigation
    .filter(item => {
      if (!item.feature) {
        return true;
      }
      return countryConfig.features[item.feature];
    })
    .map(item => ({
      ...item,
      name: item.feature === 'reserves' && countryConfig.reservesLabel 
        ? countryConfig.reservesLabel 
        : item.name,
    }));

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 transform bg-card border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">FinLatam</span>
            </Link>
          </div>

          {/* Country Selector */}
          <div className="p-4 border-b border-border">
            <CountrySelector />
          </div>

          {/* Navigation */}
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

          {/* Footer */}
          <div className="border-t border-border p-4">
            <p className="text-xs text-muted-foreground text-center">
              FinLatam v2.0.0
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
