import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutHero from '@/components/AboutHero';

import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://foryou-realestate.com';
  const canonical = `${baseUrl}/${locale}/about`;

  return {
    title: t('about'),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: t('about'),
      siteName: 'ForYou Real Estate',
      type: 'website',
      url: canonical,
      locale: locale,
      images: [
        {
          url: `https://foryou-realestate.com/thumb/about-${locale}.png`,
          width: 1200,
          height: 630,
          alt: t('about'),
        },
      ],
    },
  };
}

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <AboutHero />
      <Footer />
    </>
  );
}

