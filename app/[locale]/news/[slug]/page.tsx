import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsDetail from '@/components/NewsDetail';
import { unstable_setRequestLocale } from 'next-intl/server';
import { getNewsBySlug } from '@/lib/api';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface NewsDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

const NEWS_SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  'dispute-building-rating-dubai-rental-index': {
    title: 'Disputing Dubai Rental Index Ratings: RERA Action Guide',
    description:
      'Learn how landlords can challenge outdated Dubai Rental Index building ratings through DLD technical evaluation, required documents, and RERA procedures.',
  },
  'fairness-of-dubai-rental-index-market-value': {
    title: 'Is Dubai Rental Index Fair vs True Market Rental Value?',
    description:
      'See where the Dubai Rental Index matches market rent and where it lags, plus how Rental Valuation Certificates can support fair and grounded rent updates.',
  },
  'off-plan-property-assignment-rights-dubai-guide': {
    title: 'Off-Plan Assignment in Dubai: Rules, NOC and DLD Steps',
    description:
      'Understand off-plan assignment in Dubai: payment thresholds, developer NOC rules, transfer sequence, and DLD Oqood registration for resale transactions.',
  },
  'property-ownership-types-dubai-freehold-leasehold': {
    title: 'Freehold vs Leasehold in Dubai: Ownership Rights Guide',
    description:
      'Compare Dubai freehold and leasehold ownership by rights, inheritance, term limits, and investor suitability to choose the structure that fits your goals.',
  },
  'tresora-residential-complex-jvc-dubai': {
    title: 'Tresora JVC Dubai: Branded Apartments and Offices 2026',
    description:
      'Explore Tresora in JVC: 21-storey tower, smart-home apartments and offices, flexible payment plan, and rental yield potential for Dubai investors in 2026.',
  },
  'karl-lagerfeld-villas-meydan-dubai': {
    title: 'Karl Lagerfeld Villas Meydan: Branded Luxury Guide',
    description:
      'Review Karl Lagerfeld Villas in Meydan: branded 5-7 bedroom residences, lagoon lifestyle, premium amenities, and 60/40 payment terms for luxury buyers.',
  },
  'branded-skyscraper-sofitel-residences-downtown-dubai': {
    title: 'Sofitel Residences Downtown: Dubai Branded Living Guide',
    description:
      'Discover Sofitel Residences Downtown Dubai: branded apartments, duplexes, penthouses, hotel-level services, and long-term value in a prime city location.',
  },
  'stylish-skyflame-residential-complex-majan-dubai': {
    title: 'Skyflame Majan Dubai: Modern Apartments Investment Guide',
    description:
      'Get key facts on Skyflame in Majan: 34-storey design, studio to 2-bedroom layouts, strategic location, and rental-demand potential for focused investors.',
  },
  'dubai-recommendations-first-time-real-estate-investors': {
    title: 'First-Time Dubai Property Investor Guide for 2026+',
    description:
      'Follow practical 2026 recommendations for first-time Dubai investors: area selection, legal safeguards, cost planning, and long-term strategy for returns.',
  },
  'buying-off-plan-property-uae-step-by-step': {
    title: 'Buying Off-Plan Property in Dubai: Full 2026 Guide',
    description:
      'Learn the off-plan buying process in Dubai step by step: reservation, SPA, Oqood registration, milestone payments, snagging, and final title deed issuance.',
  },
  'where-billionaires-live-dubai-emirates-hills': {
    title: 'Emirates Hills Dubai: Where Billionaires Buy Homes',
    description:
      'Explore why Emirates Hills is a Dubai elite enclave: custom mansions, golf-front settings, privacy, and long-term capital strength for premium buyers.',
  },
  'dubai-breaks-annual-real-estate-record-ahead-of-schedule': {
    title: 'Dubai Property Market 2025: Record Transactions Analysis',
    description:
      'Analyze the Dubai record 2025 property cycle, demand drivers, investor confidence signals, and what transaction momentum means for 2026 positioning.',
  },
};

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale });
  try {
    const news = await getNewsBySlug(slug);
    if (!news) throw new Error('News not found');

    const titleText = locale === 'ru' ? news.titleRu : news.title;
    const seoOverride = locale === 'ru' ? undefined : NEWS_SEO_OVERRIDES[slug];
    const title = (seoOverride?.title || news.seoTitle || `${titleText} | ForYou Real Estate`).substring(0, 60);
    const description = (
      seoOverride?.description ||
      news.seoDescription ||
      (locale === 'ru' ? news.descriptionRu : news.description) ||
      titleText
    ).substring(0, 155);

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        images: [news.image],
        type: 'article',
        publishedTime: news.publishedAt,
        authors: ['Ruslan K.'],
      },
      alternates: {
        canonical: `https://foryou-realestate.com/${locale}/news/${slug}`,
        languages: {
          'en': `https://foryou-realestate.com/news/${slug}`,
          'ru': `https://foryou-realestate.com/ru/news/${slug}`,
          'x-default': `https://foryou-realestate.com/news/${slug}`,
        },
      }
    };
  } catch (error) {
    return {
      title: 'News | ForYou Real Estate',
    };
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug, locale } = await params;
  unstable_setRequestLocale(locale);

  const news = await getNewsBySlug(slug);

  if (!news) return null;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": locale === 'ru' ? news.titleRu : news.title,
    "image": [news.image],
    "datePublished": news.publishedAt,
    "dateModified": news.updatedAt || news.publishedAt,
    "author": [{
      "@type": "Person",
      "name": "Ruslan K.",
      "jobTitle": "Real Estate Expert",
      "url": `https://foryou-realestate.com/${locale}/about`
    }],
    "publisher": {
      "@type": "Organization",
      "name": "ForYou Real Estate",
      "logo": {
        "@type": "ImageObject",
        "url": "https://foryou-realestate.com/logo.png"
      }
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": locale === 'ru' ? "Новости" : "News",
        "item": `https://foryou-realestate.com/${locale}/news`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": locale === 'ru' ? news.titleRu : news.title,
        "item": `https://foryou-realestate.com/${locale}/news/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <NewsDetail slug={slug} />
      <Footer />
    </>
  );
}

