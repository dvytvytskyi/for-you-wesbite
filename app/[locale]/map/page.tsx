import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import MapPageContent from '@/components/MapPageContent';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://foryou-realestate.com';
  const canonical = `${baseUrl}/${locale}/map`;

  return {
    title: t('map'),
    description: t('mapDescription'),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: t('map'),
      description: t('mapDescription'),
      siteName: 'ForYou Real Estate',
      type: 'website',
      url: canonical,
      locale: locale,
      images: [
        {
          url: `https://foryou-realestate.com/thumb/properties-${locale}.png`,
          width: 1200,
          height: 630,
          alt: t('map'),
        },
      ],
    },
  };
}

export default function MapPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return <MapPageContent />;
}
