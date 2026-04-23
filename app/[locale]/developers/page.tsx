import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DevelopersList from '@/components/DevelopersList';

import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://foryou-realestate.com';
  const canonical = locale === 'en' ? `${baseUrl}/developers` : `${baseUrl}/ru/developers`;

  return {
    title: t('developers'),
    description: t('developersDescription'),
    alternates: {
      canonical: canonical,
      languages: {
        'en': `${baseUrl}/developers`,
        'ru': `${baseUrl}/ru/developers`,
        'x-default': `${baseUrl}/developers`,
      },
    },
    openGraph: {
      title: t('developers'),
      description: t('developersDescription'),
      siteName: 'ForYou Real Estate',
      type: 'website',
      url: canonical,
      locale: locale,
      images: [
        {
          url: `https://foryou-realestate.com/thumb/developers-${locale}.png`,
          width: 1200,
          height: 630,
          alt: t('developers'),
        },
      ],
    },
  };
}

export default function DevelopersPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <DevelopersList />
      <Footer />
    </>
  );
}

