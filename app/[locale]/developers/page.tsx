import Header from '@/components/Header';
import DevelopersList from '@/components/DevelopersList';

import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://foryou-realestate.com';
  const canonical = `${baseUrl}/${locale}/developers`;

  return {
    title: t('developers'),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: t('developers'),
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
    </>
  );
}

