import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getBrechaColor(nivel: string): string {
  switch (nivel) {
    case 'BAJA':
      return '#22c55e';
    case 'MEDIA':
      return '#eab308';
    case 'ALTA':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export function getBrechaClass(nivel: string): string {
  switch (nivel) {
    case 'BAJA':
      return 'text-green-500 animate-pulse-green';
    case 'MEDIA':
      return 'text-yellow-500 animate-pulse-yellow';
    case 'ALTA':
      return 'text-red-500 animate-pulse-red';
    default:
      return 'text-gray-500';
  }
}
