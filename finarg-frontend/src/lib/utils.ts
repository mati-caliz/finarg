import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CountryCode, getCountryConfig } from '@/config/countries';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, country: CountryCode = 'ar'): string {
  const config = getCountryConfig(country);
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.localCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

export function formatNumberByCountry(value: number, country: CountryCode, decimals: number = 2): string {
  const config = getCountryConfig(country);
  return new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatDate(date: string | Date, country: CountryCode = 'ar'): string {
  const config = getCountryConfig(country);
  return new Intl.DateTimeFormat(config.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date, country: CountryCode = 'ar'): string {
  const config = getCountryConfig(country);
  return new Intl.DateTimeFormat(config.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
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


