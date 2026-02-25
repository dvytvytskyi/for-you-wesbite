import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PropertyDetail from '@/components/PropertyDetail';
import PropertyDetailSkeleton from '@/components/PropertyDetailSkeleton';
import { getPropertyBySlug } from '@/lib/api';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

interface PropertyDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const startMeta = Date.now();

  try {
    console.log(`[METADATA] Starting for slug: ${slug}`);
    const property = await getPropertyBySlug(slug);
    console.log(`[METADATA] Fetched property in ${Date.now() - startMeta}ms`);

    const title = `${property.name} | ForYou Real Estate`;
    const description = property.description
      ? property.description.substring(0, 160).replace(/<[^>]*>?/gm, '') + '...'
      : t('propertiesDescription');

    const imageUrl = property.photos && property.photos.length > 0
      ? property.photos[0]
      : 'https://foryou-realestate.com/images/main-preview.jpg';

    // Helper to get price for schema/metadata
    const price = property.priceFromAED || property.priceFrom || 0;
    const formattedPrice = new Intl.NumberFormat(locale, { style: 'currency', currency: 'AED' }).format(price);

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        type: 'website',
        url: `https://foryou-realestate.com/${locale}/properties/${slug}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: property.name,
          },
        ],
        siteName: 'ForYou Real Estate',
      },
      alternates: {
        canonical: `https://foryou-realestate.com/${locale}/properties/${slug}`,
        languages: {
          'en': `https://foryou-realestate.com/properties/${slug}`,
          'ru': `https://foryou-realestate.com/ru/properties/${slug}`,
        },
      }
    };
  } catch (error) {
    return {
      title: t('properties'),
      description: t('propertiesDescription'),
    };
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug, locale } = await params;
  unstable_setRequestLocale(locale);

  // Pre-fetch property data on server for faster initial render
  const startTime = Date.now();
  let property = null;
  try {
    console.log(`[PAGE] Fetching property for slug: ${slug}`);
    property = await getPropertyBySlug(slug);
    console.log(`[PAGE] Property fetch took ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`[PAGE] Property fetch failed after ${Date.now() - startTime}ms`, error);
    // If property not found, show 404
    notFound();
  }

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.name,
    "image": property.photos || [],
    "description": property.description ? property.description.replace(/<[^>]*>?/gm, '') : "",
    "url": `https://foryou-realestate.com/${locale}/properties/${slug}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dubai",
      "addressCountry": "AE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": property.latitude,
      "longitude": property.longitude
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "AED",
      "price": property.priceFromAED || property.priceFrom || 0,
      "availability": "https://schema.org/InStock",
      "url": `https://foryou-realestate.com/${locale}/properties/${slug}`,
      "seller": {
        "@type": "RealEstateAgent",
        "name": "ForYou Real Estate"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <Suspense fallback={<PropertyDetailSkeleton />}>
        <PropertyDetail propertyId={property.id} initialProperty={property} />
      </Suspense>
      <Footer />
    </>
  );
}

