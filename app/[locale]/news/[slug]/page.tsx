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

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale });
  try {
    const news = await getNewsBySlug(slug);
    if (!news) throw new Error('News not found');

    const titleText = locale === 'ru' ? news.titleRu : news.title;
    const title = news.seoTitle || `${titleText} | ForYou Real Estate`;
    const description = (news.seoDescription || (locale === 'ru' ? news.descriptionRu : news.description) || titleText).substring(0, 160);

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

