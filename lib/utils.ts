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
 * Constants for conversion
 * 1 USD = 3.6725 AED (Pegged rate)
 * 1 SQM = 10.7639 SQFT
 */
export const AED_USD_RATE = 3.6725;
export const SQFT_SQM_RATE = 10.7639;

/**
 * Convert AED to USD
 */
export function aedToUsd(aed: number): number {
  return Math.round(aed / AED_USD_RATE);
}

/**
 * Convert USD to AED
 */
export function usdToAed(usd: number): number {
  return Math.round(usd * AED_USD_RATE);
}

/**
 * Convert m² to sqft
 */
export function sqmToSqft(sqm: number): number {
  return Math.round(sqm * SQFT_SQM_RATE * 100) / 100;
}

/**
 * Convert sqft to m²
 */
export function sqftToSqm(sqft: number): number {
  return Math.round(sqft / 10.7639 * 100) / 100;
}

/**
 * Get display price based on locale
 * Russian: USD
 * English: AED
 */
export function getDisplayPrice(priceAED: number | null | undefined, locale: string): string {
  if (!priceAED || priceAED === 0) return '';
  
  if (locale === 'ru') {
    const usd = Math.round(priceAED / 3.6725);
    return `${formatNumber(usd)} USD`;
  }
  return `${formatNumber(Math.round(priceAED))} AED`;
}

/**
 * Get display size based on locale
 * Russian: m²
 * English: sq.ft
 */
export function getDisplaySize(sizeSqFt: number | null | undefined, locale: string): string {
  if (!sizeSqFt || sizeSqFt === 0) return '';
  
  if (locale === 'ru') {
    const sqm = Math.round(sizeSqFt / 10.7639);
    return `${formatNumber(sqm)} м²`;
  }
  return `${formatNumber(Math.round(sizeSqFt))} sq.ft`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getLeadReference(): string {
  if (typeof window === 'undefined') return '';
  let ref = localStorage.getItem('fyr_lead_ref');
  if (!ref) {
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    ref = `FY-${randomChars}`;
    localStorage.setItem('fyr_lead_ref', ref);
  }
  return ref;
}

interface WhatsAppLinkParams {
  phone?: string;
  locale?: string;
  propertyName?: string;
  propertyPrice?: number | string | null;
  propertyUrl?: string;
  isConsultation?: boolean;
  contextType?: 'property' | 'area' | 'developer' | 'general';
  contextName?: string;
}

export function generateWhatsAppLink({
  phone = '971501769699',
  locale = 'en',
  propertyName = '',
  propertyPrice = null,
  propertyUrl = '',
  isConsultation = false,
  contextType = 'property',
  contextName = '',
}: WhatsAppLinkParams): string {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const urlToUse = propertyUrl || currentUrl;
  const reference = getLeadReference();

  let message = '';
  const isRu = locale === 'ru';

  if (propertyName || contextType === 'property') {
    // 1. Property Detail Scenario
    const priceStr = propertyPrice ? `\n${isRu ? 'Цена' : 'Price'}: ${formatNumber(Number(propertyPrice))} AED` : '';

    if (isRu) {
      message = `Добрый день, я хотел(а) бы узнать подробнее об этом объекте:\n\nОбъект: ${propertyName || 'Проект'}${priceStr}\nReference: ${reference}\nСсылка: ${urlToUse}`;
    } else {
      message = `Hello, I would like to get more information about this property:\n\nProperty: ${propertyName || 'Project'}${priceStr}\nReference: ${reference}\nLink: ${urlToUse}`;
    }
  } else if (contextType === 'area' || contextType === 'developer') {
    // 2. Area or Developer Scenario
    const contextLabel = contextType === 'area'
      ? (isRu ? 'Район' : 'Location')
      : (isRu ? 'Застройщик' : 'Developer');

    if (isRu) {
      message = `Добрый день, меня интересует недвижимость здесь:\n\n${contextLabel}: ${contextName}\nЗапрос: Подбор объектов и консультация\nReference: ${reference}\nСсылка: ${urlToUse}`;
    } else {
      message = `Hello, I am interested in properties here:\n\n${contextLabel}: ${contextName}\nRequest: Property Selection & Consultation\nReference: ${reference}\nLink: ${urlToUse}`;
    }
  } else {
    // 3. General Scenario
    if (isRu) {
      message = `Добрый день, меня интересует консультация по недвижимости в Дубае.\n\nЗапрос: Общая консультация / Подбор\nReference: ${reference}\nИсточник: ${urlToUse}`;
    } else {
      message = `Hello, I would like to get a consultation regarding real estate in Dubai.\n\nRequest: General Consultation\nReference: ${reference}\nSource Link: ${urlToUse}`;
    }
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
