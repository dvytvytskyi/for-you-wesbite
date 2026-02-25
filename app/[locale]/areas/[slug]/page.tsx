import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AreaDetail from '@/components/AreaDetail';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { getAreaById } from '@/lib/api';

interface AreaDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AreaDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const area = await getAreaById(slug);

  if (!area) {
    return {
      title: t('areas'),
    };
  }

  const title = locale === 'ru' ? `${area.nameRu} | Районы Дубая` : `${area.nameEn} | Dubai Areas`;
  const canonical = locale === 'en'
    ? `https://foryou-realestate.com/areas/${slug}`
    : `https://foryou-realestate.com/${locale}/areas/${slug}`;

  return {
    title: title,
    alternates: {
      canonical: canonical,
      languages: {
        'en': `https://foryou-realestate.com/areas/${slug}`,
        'ru': `https://foryou-realestate.com/ru/areas/${slug}`,
      },
    },
    openGraph: {
      title: title,
      url: canonical,
      locale: locale,
      type: 'website',
      siteName: 'ForYou Real Estate',
    }
  };
}

export default async function AreaDetailPage({ params }: AreaDetailPageProps) {
  const { slug, locale } = await params;
  unstable_setRequestLocale(locale);

  // Structured Data (JSON-LD)
  const jsonLd = {
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
        "name": locale === 'ru' ? 'Районы' : 'Areas',
        "item": `https://foryou-realestate.com/${locale}/areas`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": slug,
        "item": `https://foryou-realestate.com/${locale}/areas/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <AreaDetail slug={slug} />
      <Footer />
    </>
  );
}

