import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AreasList from '@/components/AreasList';

import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://foryou-realestate.com';
  const canonical = `${baseUrl}/${locale}/areas`;

  return {
    title: t('areas'),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: t('areas'),
      siteName: 'ForYou Real Estate',
      type: 'website',
      url: canonical,
      locale: locale,
      images: [
        {
          url: `https://foryou-realestate.com/thumb/areas-${locale}.png`,
          width: 1200,
          height: 630,
          alt: t('areas'),
        },
      ],
    },
  };
}

export default function AreasPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <AreasList />
      <Footer />
    </>
  );
}

