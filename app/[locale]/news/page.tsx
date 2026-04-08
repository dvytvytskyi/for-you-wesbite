import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsList from '@/components/NewsList';

import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://foryou-realestate.com';
  const canonical = `${baseUrl}/${locale}/news`;

  return {
    title: t('news'),
    description: t('newsDescription'),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: t('news'),
      description: t('newsDescription'),
      siteName: 'ForYou Real Estate',
      type: 'website',
      url: canonical,
      locale: locale,
      images: [
        {
          url: `https://foryou-realestate.com/thumb/news-${locale}.png`,
          width: 1200,
          height: 630,
          alt: t('news'),
        },
      ],
    },
  };
}

export default function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Header />
      <NewsList />
      <Footer />
    </>
  );
}

