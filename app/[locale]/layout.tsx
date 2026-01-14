import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import NavigationProgress from '@/components/NavigationProgress';
import { FavoritesProvider } from '@/lib/favoritesContext';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: 'For You Real Estate | Dubai Properties',
    description: t('subtitle'),
  };
}

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
    <html lang={locale}>
      <head>
        {/* Preconnect to external domains to speed up initial connections */}
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <FavoritesProvider>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            {children}
          </FavoritesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
