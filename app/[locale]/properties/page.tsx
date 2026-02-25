import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertiesList from '@/components/PropertiesList';

import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

// Define types for params
type Props = {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://foryou-realestate.com';
  // Handle pagination in canonical if needed, but usually just the base is enough for listing root
  const canonical = locale === 'en' ? `${baseUrl}/properties` : `${baseUrl}/${locale}/properties`;

  return {
    title: t('properties'),
    description: t('propertiesDescription'),
    alternates: {
      canonical: canonical,
      languages: {
        'en': `${baseUrl}/properties`,
        'ru': `${baseUrl}/ru/properties`,
      },
    },
    openGraph: {
      title: t('properties'),
      description: t('propertiesDescription'),
      siteName: 'ForYou Real Estate',
      type: 'website',
      url: canonical,
      locale: locale,
      images: [
        {
          url: `https://foryou-realestate.com/thumb/properties-${locale}.png`,
          width: 1200,
          height: 630,
          alt: locale === 'ru' ? 'Каталог недвижимости в Дубае' : 'Dubai Properties Catalog',
        },
      ],
    },
  };
}

export default function PropertiesPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);

  // JSON-LD for Breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": locale === 'ru' ? 'Главная' : 'Home',
        "item": `https://foryou-realestate.com/${locale === 'en' ? '' : locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": locale === 'ru' ? 'Каталог' : 'Properties',
        "item": `https://foryou-realestate.com/${locale}/properties`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <PropertiesList />
      <Footer />
    </>
  );
}
