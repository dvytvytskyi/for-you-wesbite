import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { FavoritesProvider } from '@/lib/favoritesContext';
import Tracker from '@/components/Tracker';
import FloatingSocial from '@/components/FloatingSocial';
import CookieConsent from '@/components/CookieConsent';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'hero' });
  const baseUrl = 'https://www.foryou-realestate.com';
  
  return {
    metadataBase: new URL(baseUrl),
    title: 'For You Real Estate | Dubai Properties',
    description: t('subtitle'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'ru': '/ru',
      },
    },
  };
}

import { Inter, Cormorant_Garamond } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <FavoritesProvider>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <Tracker />
        {children}
        <FloatingSocial />
        <CookieConsent />
      </NextIntlClientProvider>
    </FavoritesProvider>
  );
}
