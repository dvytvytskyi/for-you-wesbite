import { useEffect, useState } from 'react';

/**
 * Debounce hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Convert AED to USD
 */
export function aedToUsd(aed: number): number {
  return Math.round(aed / 3.67);
}

/**
 * Convert USD to AED
 */
export function usdToAed(usd: number): number {
  return Math.round(usd * 3.67);
}

/**
 * Convert m² to sqft
 */
export function sqmToSqft(sqm: number): number {
  return Math.round(sqm * 10.764 * 100) / 100;
}

/**
 * Convert sqft to m²
 */
export function sqftToSqm(sqft: number): number {
  return Math.round(sqft / 10.764 * 100) / 100;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

