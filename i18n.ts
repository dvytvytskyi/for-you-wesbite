import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ru'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({ locale }) => {
  // Use default locale if the provided one is not supported
  const currentLocale = locales.includes(locale as any) ? locale : defaultLocale;

  return {
    messages: (await import(`./messages/${currentLocale}.json`)).default
  };
});
