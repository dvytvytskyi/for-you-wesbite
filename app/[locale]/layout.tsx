import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
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
    <html lang={locale} className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        {/* Preconnect to external domains to speed up initial connections */}
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": [
                  {
                    "@type": "SiteNavigationElement",
                    "position": 1,
                    "name": locale === 'ru' ? 'Каталог' : 'Properties',
                    "url": `https://foryou-realestate.com/${locale}/properties`
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 2,
                    "name": locale === 'ru' ? 'Районы' : 'Areas',
                    "url": `https://foryou-realestate.com/${locale}/areas`
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 3,
                    "name": locale === 'ru' ? 'Застройщики' : 'Developers',
                    "url": `https://foryou-realestate.com/${locale}/developers`
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 4,
                    "name": locale === 'ru' ? 'О нас' : 'About Us',
                    "url": `https://foryou-realestate.com/${locale}/about`
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "url": "https://foryou-realestate.com/",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `https://foryou-realestate.com/${locale}/properties?search={search_term_string}`,
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
