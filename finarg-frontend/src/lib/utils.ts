import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CountryCode, getCountryConfig } from '@/config/countries';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencySimple(value: number, country: CountryCode = 'ar'): string {
  const config = getCountryConfig(country);
  return `${config.currencySymbol} ${formatNumber(value, 2)}`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatReservesUSD(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value)) + ' M USD';
}

export function getGapColor(level: string): string {
  switch (level) {
    case 'LOW':
    case 'BAJA':
      return '#22c55e';
    case 'MEDIUM':
    case 'MEDIA':
      return '#eab308';
    case 'HIGH':
    case 'ALTA':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export function getGapClass(level: string): string {
  switch (level) {
    case 'LOW':
    case 'BAJA':
      return 'text-green-500 animate-pulse-green';
    case 'MEDIUM':
    case 'MEDIA':
      return 'text-yellow-500 animate-pulse-yellow';
    case 'HIGH':
    case 'ALTA':
      return 'text-red-500 animate-pulse-red';
    default:
      return 'text-gray-500';
  }
}

function quoteVariantOrder(type: string): number {
  if (type === 'oficial' || type.endsWith('_oficial')) {
    return 0;
  }
  if (type === 'blue' || type.endsWith('_blue')) {
    return 1;
  }
  if (type === 'tarjeta' || type.endsWith('_tarjeta')) {
    return 2;
  }
  return 3;
}

export function sortQuotesByVariant<T extends { type: string }>(quotes: T[]): T[] {
  return [...quotes].sort((a, b) => quoteVariantOrder(a.type) - quoteVariantOrder(b.type));
}
